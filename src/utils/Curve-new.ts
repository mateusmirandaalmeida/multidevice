import * as Curve from "curve25519-js";
import { randomBytes } from "./Utils";
import { curve } from 'libsignal';

export interface KeyPair {
  pubKey: Uint8Array;
  privKey: Uint8Array;
}

export interface SignedKeyPair {
  keyId: number;
  keyPair: KeyPair;
  signature: Uint8Array;
}

export interface PreKey {
  keyId: number;
  keyPair: KeyPair;
}

export const isNonNegativeInteger = (n: number) =>
  typeof n === "number" && n % 1 === 0 && n >= 0;

export const generateIdentityKeyPair = () => {
  /*const keyPair = Curve.generateKeyPair(randomBytes(32));

  return <KeyPair>{
    pubKey: keyPair.public,
    privKey: keyPair.private,
  };*/

  const keyPair = curve.generateKeyPair();
  keyPair.pubKey = keyPair.pubKey.slice(1);
  return <KeyPair>keyPair;
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

  const keyPair = curve.generateKeyPair();
  const sig = curve.calculateSignature(identityKeyPair.privKey, keyPair.pubKey);
    return {
        keyId: signedKeyId,
        keyPair: {
          privKey: keyPair.privKey,
          pubKey: keyPair.pubKey.slice(1)
        },
        signature: sig
    };
};

export const generatePreKey = (keyId: number) => {
  if (!isNonNegativeInteger(keyId)) {
    throw new TypeError("Invalid argument for keyId: " + keyId);
  }

  const keyPair = generateIdentityKeyPair();
  return <PreKey>{
    keyId,
    keyPair,
  };
};

export const sharedKey = (pubKey: Uint8Array, privKey: Uint8Array) => {
  return Curve.sharedKey(privKey, pubKey);
}