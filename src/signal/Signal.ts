import { ProtocolAddress } from './ProtocolAddress';
import { generatePreKey, Key, PreKey } from './../utils/Curve';
import libsignal from 'libsignal';
import { WapJid } from './../proto/WapJid';
import { StorageService } from '../services/StorageService';
import { StorageSignal } from './StorageSignal';
import ByteBuffer from 'bytebuffer';

interface IIdentity {
    identifier: ProtocolAddress;
    identifierKey: Key;
}

export class WaSignal {
    constructor(public storageService: StorageService, public storageSignal: StorageSignal) {}

    toSignalCurvePubKey = (pubKey: any) => {
        const newPub = new Uint8Array(33);
        newPub.set([5], 0);
        newPub.set(pubKey, 1);

        return newPub;
    };

    createSignalAddress = (name: string, deviceId: number) => new ProtocolAddress(name, deviceId);

    putIdentity = async (address: ProtocolAddress, key: Key) => {
        const identities = await this.storageService.getOrSave<IIdentity[]>('identities', () => []);

        identities.push({
            identifier: address,
            identifierKey: key,
        });

        await this.storageService.save('identities', identities);
    };

    putMeta = async (metaName: string, value: any) => {
        const metas = await this.storageService.getOrSave('metas', () => {});

        metas[metaName] = value;

        this.storageService.save('metas', metas);
    };

    getMeta = async <T = any>(metaName: string): Promise<T> => {
        const metas = await this.storageService.getOrSave('metas', () => {
            return {};
        });

        return metas[metaName] ?? null;
    };

    getPreKeysByRange = async (range: number, limit: number) => {
        const preKeys = await this.storageService.getOrSave<PreKey[]>('preKeys', () => []);

        return preKeys.filter((keys) => keys.keyId > range - 1).slice(0, limit);
    };

    savePreKeys = async (keys: PreKey[]) => {
        if (!keys) {
            return;
        }

        const lastKey = keys[keys.length - 1];
        await this.putMeta('nextPreKeyId', lastKey.keyId + 1);

        const preKeys = await this.storageService.getOrSave<PreKey[]>('preKeys', () => []);

        keys.map((key) => {
            const exists = preKeys.find((p) => p.keyId == key.keyId);
            if (exists) {
                throw Error(`preKey id ${key.keyId} already exists`);
            }

            preKeys.push(key);
        });

        await this.storageService.save('preKeys', preKeys);

        return true;
    };

    getOrGenPreKeys = async (range: number) => {
        const firstUnuploadedId = (await this.getMeta('firstUnuploadedId')) ?? 1;
        const nextPreKeyId = (await this.getMeta('nextPreKeyId')) ?? 1;

        const avaliable = nextPreKeyId - firstUnuploadedId;
        const remaining = range - avaliable;

        if (remaining <= 0) {
            console.log(`getOrGenPreKeys: no prekey needs to be generated, avaliable: ${avaliable}, need: ${range}`);
            return this.getPreKeysByRange(firstUnuploadedId, range);
        }

        const keys = ((range: number, limit: number) => {
            const out = [];
            for (let a = range; a < limit; a++) {
                out.push(a);
            }
            return out;
        })(nextPreKeyId, nextPreKeyId + remaining).map((keyId) => generatePreKey(keyId));

        await this.savePreKeys(keys);

        return this.getPreKeysByRange(firstUnuploadedId, range);
    };

    markKeyAsUploaded = async (id: number) => {
        const firstUnuploadedId = await this.getMeta('firstUnuploadedId');
        const nextPreKeyId = (await this.getMeta('nextPreKeyId')) ?? 1;

        if (id < 0 || !nextPreKeyId || id >= nextPreKeyId) {
            throw Error(`markKeyAsUploaded: key ${id} is out of boundary.`);
        }

        await this.putMeta('firstUnuploadedId', firstUnuploadedId ? Math.max(firstUnuploadedId, id + 1) : id + 1);
    };

    putServerHasPreKeys = async (flag: boolean) => {
        await this.putMeta('serverHasPreKeys', flag);
    };

    getServerHasPreKeys = async () => {
        return this.getMeta<boolean>('serverHasPreKeys');
    };

    createLibSignalAddress = (e: WapJid) => {
        if (!(e.isUser() || e.isServer() || e.isPSA())) throw new Error(`Jid ${e.toString()} is not fully qualified, jid.server should be "s.whatsapp.net"`);

        return new libsignal.ProtocolAddress(e.getSignalAddress(), 0);
    };

    decryptSignalProto = async (e, t, r) => {
        try {
            const session = new libsignal.SessionCipher(this.storageSignal, this.createLibSignalAddress(e));

            switch (t) {
                case 'pkmsg':
                    return session.decryptPreKeyWhisperMessage(r);
                case 'msg':
                    return session.decryptWhisperMessage(r);
                default:
                    return Promise.reject(`decryptSignalProto: Received unsupported msg type ${t}`);
            }
        } catch (err) {
            if (e && 'call_failure' === e.reason && e.value && 'number' == typeof e.value.result) {
                console.log(`decryptSignalProto error code ${e.value.result}`);
            } else {
                if (e && 'MessageCounterError' === e.name) {
                    //return Promise.reject(new i.SignalMessageCounterError(e));
                    console.log('SignalMessageCounterError', e);
                    throw err;
                }

                console.log(`decryptSignalProto js error ${e}`);
            }

            throw err;
        }
    };

    /** whatsapp web file qr: line 36027 */
    strToBuffer = function (e) {
        return ByteBuffer.wrap(e,"binary").toArrayBuffer()
    };

    encryptSignalProto = async (e, t) => {
        var r = new libsignal.SessionCipher(this.storageSignal, this.createLibSignalAddress(e));

        return Promise.resolve(r)
            .then((e) => {
                return e.encrypt(Buffer.from(t))
            })
            .then(({ type: e, body: t }) => {
                return {
                    type: 3 === e ? 'pkmsg' : 'Msg',
                    ciphertext: this.strToBuffer(t),
                }
            });
    };
}
