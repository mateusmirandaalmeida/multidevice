import * as Crypto from 'crypto';
import { Binary } from './../proto/Binary';

const crypto = Crypto.webcrypto as any;

export const expand = async (rawKey: Uint8Array, info: string, size: number): Promise<Buffer> => {
    if (size < 0 || size > 8160) {
        throw new Error(`expand given bad length ${size}`);
    }

    const block = Math.ceil(size / 32);
    const bytes = Binary.build(info).readByteArray();
    const data = new Binary();

    const key = await crypto.subtle.importKey(
        'raw',
        rawKey,
        {
            name: 'HMAC',
            hash: 'SHA-256',
        },
        false,
        ['sign'],
    );

    let lastSig = new Uint8Array(0);
    for (let index = 1; index <= block; index++) {
        const signature = await crypto.subtle.sign(
            {
                name: 'HMAC',
                hash: 'SHA-256',
            },
            key,
            Binary.build(lastSig, bytes, index).readByteArray(),
        );

        const currSig = new Uint8Array(signature);
        data.writeByteArray(currSig);

        lastSig = currSig;
    }

    return data.readBuffer(size);
};

export const hmacSha256 = async (salt: ArrayBuffer, data: Uint8Array) => {
    const key = await crypto.subtle.importKey(
        'raw',
        salt,
        {
            name: 'HMAC',
            hash: 'SHA-256',
        },
        false,
        ['sign'],
    );

    return crypto.subtle.sign(
        {
            name: 'HMAC',
            hash: 'SHA-256',
        },
        key,
        data,
    );
};

export const extract = async (salt: ArrayBuffer, data: Uint8Array) => {
    const keyData = salt || new Uint8Array(32);

    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        {
            name: 'HMAC',
            hash: 'SHA-256',
        },
        false,
        ['sign'],
    );

    return crypto.subtle.sign(
        {
            name: 'HMAC',
            hash: 'SHA-256',
        },
        key,
        data,
    );
};

export const extractAndExpand = async (data: Uint8Array, info: string, size: number) => {
  const key = await extract(null, data);
  return expand(new Uint8Array(key), info, size);
};

export const extractWithSaltAndExpand = async (data: Uint8Array, salt: ArrayBuffer, info: string, size: number) => {
  const key = await extract(salt, data);
  return expand(new Uint8Array(key), info, size);
};