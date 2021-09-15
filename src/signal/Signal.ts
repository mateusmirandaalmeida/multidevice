import { ProtocolAddress } from './ProtocolAddress';
import { generatePreKey, Key, PreKey } from '../utils/Curve';
import libsignal from 'libsignal';
import { WapJid } from '../proto/WapJid';
import { StorageService } from '../services/StorageService';
import { StorageSignal } from './StorageSignal';
import ByteBuffer from 'bytebuffer';
import { proto as WAProto } from '../../WAMessage/WAMessage';
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

    getOrGenSinglePreKey() {
        return this.getOrGenPreKeys(1).then((e) => {
            if (1 !== e.length) throw Error(`Expected to get exactly one key but got ${e.length}`);
            return e[0];
        });
    }

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
        if (!(e.isUser() || e.isServer() || e.isPSA())) {
            console.log('useeeer', e);
            throw new Error(`Jid ${e.toString()} is not fully qualified, jid.server should be "s.whatsapp.net"`);
        }

        return new libsignal.ProtocolAddress(e.getSignalAddress(), 0);
    };

    hasSession(user: WapJid) {
        return this.storageSignal.hasSession(this.createLibSignalAddress(user));
    }

    async processSenderKeyDistributionMessage(group, author, senderKeyDistributionMessage: WAProto.ISenderKeyDistributionMessage) {
        const builder = new libsignal.GroupSessionBuilder(this.storageSignal);

        const senderName = new libsignal.SenderKeyName(group.toString(), this.createLibSignalAddress(author));

        //console.log('processSenderKeyDistributionMessage::senderName', senderName);

        const senderMsg = new libsignal.SenderKeyDistributionMessage(null, null, null, null, senderKeyDistributionMessage.axolotlSenderKeyDistributionMessage);

        if (!(await this.storageSignal.loadSenderKey(senderName))) {
            const record = new libsignal.SenderKeyRecord();
            this.storageSignal.storeSenderKey(senderName, record);
        }

        await builder.process(senderName, senderMsg);
    }

    decryptGroupSignalProto = async (group, author, data) => {
        try {
            const senderName = new libsignal.SenderKeyName(group.toString(), this.createLibSignalAddress(author));
            //console.log('decryptGroupSignalProto::senderName', senderName);
            //console.log('decryptGroupSignalProto::session', await this.storageSignal.loadSenderKey(senderName));

            const session = new libsignal.GroupCipher(this.storageSignal, senderName);

            return session.decrypt(data);
        } catch (err) {
            console.log('err', err);

            throw err;
        }

        /*var a = new window.libsignal.GroupCipher((0,
        s.default)(),e.toString({
            legacy: !0
        }),(0,
        l.createSignalAddress)(t));
        return Promise.resolve(a).then((e=>e.decryptSenderKeyMessage(r))).catch((e=>e && "MessageCounterError" === e.name ? Promise.reject(new i.SignalMessageCounterError(e)) : Promise.reject(new i.SignalDecryptionError(e))))*/
    };

    removeSession = async (e) => {
        await this.storageSignal.removeSession(this.createLibSignalAddress(e));
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
        return ByteBuffer.wrap(String.fromCharCode.apply(null, e), 'binary').toArrayBuffer();
    };

    encryptSignalProto = async (e, t) => {
        var r = new libsignal.SessionCipher(this.storageSignal, this.createLibSignalAddress(e));

        return Promise.resolve(r)
            .then((e) => {
                return e.encrypt(Buffer.from(t));
            })
            .then(({ type: e, body: t }) => {
                return {
                    type: 3 === e ? 'pkmsg' : 'msg',
                    ciphertext: this.strToBuffer(t),
                };
            });
    };

    async encryptSenderKeyMsgSignalProto(group, author, t) {
        try {
            const senderName = new libsignal.SenderKeyName(
                group.toString({
                    legacy: !0,
                }),
                this.createLibSignalAddress(author),
            );
            const builder = new libsignal.GroupSessionBuilder(this.storageSignal);
            if (!(await this.storageSignal.loadSenderKey(senderName))) {
                const record = new libsignal.SenderKeyRecord();
                await this.storageSignal.storeSenderKey(senderName, record);
            }
            const senderKeyDistributionMessage = await builder.create(senderName);
            const session = new libsignal.GroupCipher(this.storageSignal, senderName);
            return {
                ciphertext: await session.encrypt(t),
                senderKeyDistributionMessage,
            };
        } catch (e) {
            throw e;
        }
    }

    async createSignalSession(jid: WapJid, device: any) {
        const session = new libsignal.SessionBuilder(this.storageSignal, this.createLibSignalAddress(jid));
        await session.initOutgoing(device);
    }
}
