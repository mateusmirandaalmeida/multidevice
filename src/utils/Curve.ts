import * as Curve from "curve25519-js";
import { decode } from "punycode";
import { decodeB64, encodeB64 } from "./Base64";
import { randomBytes } from "./Utils";


export class Key {
  constructor(public key: Uint8Array) {}

  public toJSON() {
    return {
      type: 'key',
      key: encodeB64(this.key),
    }
  }

  static parse(data: any) {
    const key = new Uint8Array(decodeB64(data.key));
    return new Key(key);
  }
}

export class KeyPair {
  constructor(public pubKey: Uint8Array, public privKey: Uint8Array) {}

  public toJSON() {
    return {
      type: 'keyPair',
      pubKey: encodeB64(this.pubKey),
      privKey: encodeB64(this.privKey),
    }
  }

  static parse(data: any) {
    const pubKey = new Uint8Array(decodeB64(data.pubKey));
    const privKey = new Uint8Array(decodeB64(data.privKey));

    return new KeyPair(pubKey, privKey);
  }
}

export class SignedKeyPair {
  constructor(public keyId: number, public keyPair: KeyPair, public signature: Uint8Array) {}

  public toJSON() {
    return {
      type: 'signedKeyPair',
      keyId: this.keyId,
      keyPair: this.keyPair.toJSON(),
      signature: encodeB64(this.signature),
    }
  }

  static parse(data: any) {
    const keyPair = KeyPair.parse(data.keyPair);
    const keyId: number = data.keyId;
    const signature = new Uint8Array(decodeB64(data.signature))

    return new SignedKeyPair(keyId, keyPair, signature);
  }
}

export class PreKey {
  constructor(public keyId: number, public keyPair: KeyPair) {}

  public toJSON() {
    return {
      type: 'preKey',
      keyId: this.keyId,
      keyPair: this.keyPair.toJSON(),
    }
  }

  static parse(data: any) {
    const keyPair = KeyPair.parse(data.keyPair);
    const keyId: number = data.keyId;

    return new PreKey(keyId, keyPair);
  }
}

export const isNonNegativeInteger = (n: number) =>
  typeof n === "number" && n % 1 === 0 && n >= 0;

export const generateIdentityKeyPair = () => {
  const keyPair = Curve.generateKeyPair(randomBytes(32));

  return new KeyPair(
    keyPair.public,
    keyPair.private,
  );
};

export const generateRegistrationId = function () {
  var registrationId = Uint16Array.from(randomBytes(2))[0];
  return registrationId & 0x3fff;
};

export const generateSignedPreKey = (
  identityKeyPair: KeyPair,
  signedKeyId: number
) => {
  if (!isNonNegativeInteger(signedKeyId)) {
    throw new TypeError("Invalid argument for signedKeyId: " + signedKeyId);
  }

  const keyPair = generateIdentityKeyPair(); 
  const pubKey = new Uint8Array(33); // (ノಠ益ಠ)ノ彡┻━┻
  pubKey.set([5], 0);
  pubKey.set(keyPair.pubKey, 1);

  const sig = Curve.sign(identityKeyPair.privKey, pubKey, null);

  return new SignedKeyPair(signedKeyId, keyPair, sig);
};

export const generatePreKey = (keyId: number) => {
  if (!isNonNegativeInteger(keyId)) {
    throw new TypeError("Invalid argument for keyId: " + keyId);
  }

  const keyPair = generateIdentityKeyPair();
  return new PreKey(keyId, keyPair);
};

export const sharedKey = (pubKey: Uint8Array, privKey: Uint8Array) => {
  return Curve.sharedKey(privKey, pubKey);
}

export const verifySignature = (pubKey: Uint8Array, message: any, sig: any) => {
  return Curve.verify(pubKey, message, sig);
}

export const calculateSignature = (privKey: Uint8Array, message: Uint8Array) => {
  return Curve.sign(privKey, message, null);
}