import { Key, KeyPair, PreKey } from '../utils/Curve';
import { SignedKeyPair } from './../utils/Curve';
import { StorageService } from '../services/StorageService';

export class StorageSignal {
    private senderKeys = {};
    private sessions = {};

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
        console.log('remove pre key', keyId);
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
        console.log('loadSession', identifier);
        if (!this.sessions[identifier]) {
            return null;
        }

        return this.sessions[identifier];
    }

    async loadSenderKey(senderKey) {
        return this.senderKeys[senderKey] ?? null;
    }

    async storeSenderKey(senderKey, record) {
        return this.senderKeys[senderKey] = record;
    }

    async storeSession(identifier, record) {
        console.log('storeSession', identifier);
        this.sessions[identifier] = record;
    }

    async removeSession(identifier) {
        if (this.sessions[identifier]) {
            delete this.sessions[identifier];
        }
    }

    async removeAllSessions() {
        this.sessions = {};
    }

    async hasSession(identifier) {
        return !!this.sessions[identifier]
    }
}
