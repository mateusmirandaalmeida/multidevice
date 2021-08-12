import { KeyPair, PreKey } from '../utils/Curve';
import { SignedKeyPair } from './../utils/Curve';
import { StorageService } from '../services/StorageService';
import libsignal from 'libsignal';
import { WapJid } from '../proto/WapJid';

export class StorageSignal {
    constructor(public storageService: StorageService) {}

    public static DIRECTION: {
        SENDING: 1;
        RECEIVING: 2;
    };

    getOurRegistrationId() {
        return this.storageService.get<number>('registrationId');
    }

    getOurIdentity() {
        const signedIdentityKey = this.storageService.get<KeyPair>('signedIdentityKey');

        const pubKey = new Uint8Array(33); // (ノಠ益ಠ)ノ彡┻━┻
        pubKey.set([5], 0);
        pubKey.set(signedIdentityKey.pubKey, 1);

        return {
            privKey: Buffer.from(signedIdentityKey.privKey),
            pubKey: Buffer.from(pubKey),
        };
    }

    getLocalRegistrationId() {
        const registrationId = this.storageService.get<number>('registrationId');
        return registrationId;
    }

    isTrustedIdentity(identifier, identityKey, direction) {
        return true; // TODO
    }

    /* Returns a prekeypair object or undefined */
    loadPreKey(keyId) {
        const preKeys = this.storageService.get<PreKey[]>('preKeys');
        const preKey = preKeys.find((prekey) => prekey.keyId == keyId);

        if (!preKey) {
            return null;
        }

        const test = {
            privKey: Buffer.from(preKey.keyPair.privKey),
            pubKey: Buffer.from(preKey.keyPair.pubKey),
        };

        return test;
    }

    async removePreKey(keyId) {
        return;
        const preKeys = this.storageService.get<PreKey[]>('preKeys');
        const index = preKeys.findIndex((preKey) => preKey.keyId == keyId);
        if (index != -1) {
            preKeys.splice(index, 1);
        }
        await this.storageService.save('preKeys', preKeys);
    }

    /* Returns a signed keypair object or undefined */
    async loadSignedPreKey(keyId) {
        const signedPreKey = await this.storageService.get<SignedKeyPair>('signedPreKey');
        return {
            privKey: Buffer.from(signedPreKey.keyPair.privKey),
            pubKey: Buffer.from(signedPreKey.keyPair.pubKey),
        };
    }

    async loadSession(identifier) {
        const sessions = await this.storageService.getOrSave('sessions', () => {
            return {};
        }, true);

        if (!sessions[identifier]) {
            return null;
        }

        if (sessions[identifier]) {
            return sessions[identifier]
            // const data = sessions[identifier];
            // const record = new libsignal.SessionRecord();
            // record.version = data.version;
            // Object.keys(data.sessions).forEach((key) => {
            //     const session = data.sessions[key];
            //     record.sessions[key] = libsignal.SessionRecord.createEntry();
            //     record.sessions[key]._chains = session._chains;
            //     record.sessions[key].currentRatchet = session.currentRatchet;
            //     record.sessions[key].indexInfo = session.indexInfo;
            //     record.sessions[key].registrationId = session.registrationId;
            // });
            // return record;
        }

        return null;
    }

    async storeSession(identifier, record) {
        const sessions = await this.storageService.getOrSave('sessions', () => {
            return {};
        }, true);

        sessions[identifier] = record;

        await this.storageService.save('sessions', sessions, true);
    }

    async removeSession(identifier) {
        const sessions = await this.storageService.getOrSave('sessions', () => {
            return {};
        }, true);

        if (sessions[identifier]) {
            delete sessions[identifier];
        }

        await this.storageService.save('sessions', sessions, true);
    }

    async removeAllSessions() {
        await this.storageService.save('sessions', {}, true);
    }

    async hasSession(identifier) {
        const sessions = await this.storageService.get('sessions', true);
        return !!sessions[identifier]
    }
}
