import { KeyPair, PreKey } from '../utils/Curve';
import { storageService } from './../services/StorageService';
import { SignedKeyPair } from './../utils/Curve';
import libsignal from 'libsignal';

class StorageSignal {
    public static DIRECTION: {
        SENDING: 1;
        RECEIVING: 2;
    };

    getOurIdentity() {
        const signedIdentityKey = storageService.get<KeyPair>('signedIdentityKey');

        const pubKey = new Uint8Array(33); // (ノಠ益ಠ)ノ彡┻━┻
        pubKey.set([5], 0);
        pubKey.set(signedIdentityKey.pubKey, 1);

        return {
            privKey: Buffer.from(signedIdentityKey.privKey),
            pubKey: Buffer.from(pubKey),
        };
    }

    getLocalRegistrationId() {
        const registrationId = storageService.get<number>('registrationId');
        return registrationId;
    }

    isTrustedIdentity(identifier, identityKey, direction) {
        return true; // TODO
    }

    /* Returns a prekeypair object or undefined */
    loadPreKey(keyId) {
        const preKeys = storageService.get<PreKey[]>('preKeys');
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
        return true;
        const preKeys = storageService.get<PreKey[]>('preKeys');

        preKeys.splice(preKeys.findIndex((preKey) => preKey.keyId == keyId), 1);

        await storageService.save('preKeys', preKeys);
    }

    /* Returns a signed keypair object or undefined */
    async loadSignedPreKey(keyId) {
        const signedPreKey = await storageService.get<SignedKeyPair>('signedPreKey');
        return {
            privKey: Buffer.from(signedPreKey.keyPair.privKey),
            pubKey: Buffer.from(signedPreKey.keyPair.pubKey),
        };
    }

    async loadSession(identifier) {
        return null;
        const sessions = await storageService.getOrSave('sessions', () => {
            return {};
        });

        if (!sessions[identifier]) {
            return null;
        }

        return sessions[identifier];
    }

    async storeSession(identifier, record) {
        return null;
        const sessions = await storageService.getOrSave('sessions', () => {
            return {};
        });

        sessions[identifier] = record;

        await storageService.save('sessions', sessions);
    }

    async removeSession(identifier) {
        const sessions = await storageService.getOrSave('sessions', () => {
            return {};
        });

        if (sessions[identifier]) {
            delete sessions[identifier];
        }

        await storageService.save('sessions', sessions);
    }

    async removeAllSessions(identifier) {
        await storageService.save('sessions', {});
    }
}

export const storageSignal = new StorageSignal();
