import { Binary } from '../proto/Binary';
import { FrameSocket } from './FrameSocket';
import { Resolvable } from '../utils/Resolvable';
import * as Crypto from 'crypto';
import { extractWithSaltAndExpand } from '../utils/HKDF';
import { NoiseSocket } from './NoiseSocket';

const crypto = Crypto.webcrypto as any;

export class NoiseHandshake {
    private hash: Buffer;
    private salt: Buffer;
    private cryptoKey: any;
    private counter = 0;
    private socket: FrameSocket;
    private rejectOnClose: Resolvable;

    constructor(socket: FrameSocket) {
        this.counter = 0;
        this.socket = socket;
        this.rejectOnClose = new Resolvable();
        socket.onClose = this.handleClose.bind(this);
    }

    public async start(pattern: string, header: Uint8Array) {
        const data = Binary.build(pattern).readBuffer() as Buffer;
        const hash = data.byteLength == 32 ? data : await crypto.subtle.digest('SHA-256', data);

        this.hash = hash;
        this.salt = hash;
        this.cryptoKey = await this.importKey(hash);
        await this.authenticate(header);
    }

    public sendAndReceive(data: Uint8Array) {
        const currSocket = this.socket;
        const result = new Promise((resolve) => {
            currSocket.onFrame = (data: any) => {
                currSocket.onFrame = null;

                resolve(data);
            };

            currSocket.sendFrame(data);
        });

        return this.orRejectOnClose(result);
    }

    public send(data: Uint8Array) {
        this.socket.sendFrame(data);
    }

    public async authenticate(data: Uint8Array) {
        this.hash = await crypto.subtle.digest('SHA-256', Binary.build(this.hash, data).readByteArray());
    }

    public async encrypt(data: Uint8Array) {
        const currCount = this.counter++;

        const ciphertext = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: this.generateIv(currCount),
                additionalData: this.hash ? new Uint8Array(this.hash) : new Uint8Array(0),
            },
            this.cryptoKey,
            data,
        );

        await this.authenticate(ciphertext);

        return this.orRejectOnClose(ciphertext);
    }

    public async decrypt(data: Uint8Array) {
        const currCount = this.counter++;

        const plaintext = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: this.generateIv(currCount),
                additionalData: this.hash ? new Uint8Array(this.hash) : new Uint8Array(0),
            },
            this.cryptoKey,
            data,
        );

        await this.authenticate(data);

        return this.orRejectOnClose(plaintext);
    }

    public async finish(): Promise<NoiseSocket> {
        const [write, read] = await this.extractAndExpand(this.salt, new Uint8Array(0));

        const writeKey = await this.importKey(write, ['encrypt']);
        const readKey = await this.importKey(read, ['decrypt']);

        const socket = new NoiseSocket(this.socket, writeKey, readKey);

        return this.orRejectOnClose(socket);
    }

    public async mixIntoKey(data: ArrayBuffer) {
        this.counter = 0;
        const [write, read] = await this.extractAndExpand(this.salt, new Uint8Array(data));
        this.salt = write;
        this.cryptoKey = await this.importKey(read);
    }

    private async orRejectOnClose(data: any) {
        return Promise.race([data, this.rejectOnClose.promise]).then((e) => (this.rejectOnClose.resolveWasCalled() ? this.rejectOnClose.promise : e));
    }

    private async importKey(key: Buffer, usages = ['encrypt', 'decrypt']) {
        return crypto.subtle.importKey('raw', new Uint8Array(key), 'AES-GCM', false, usages);
    }

    private generateIv(count: number) {
        const iv = new ArrayBuffer(12);
        new DataView(iv).setUint32(8, count);

        return new Uint8Array(iv);
    }

    private async extractAndExpand(salt: ArrayBuffer, data: Uint8Array) {
        const key = await extractWithSaltAndExpand(data, new Uint8Array(salt), '', 64);

        return [key.slice(0, 32), key.slice(32)];
    }

    private handleClose() {
        this.rejectOnClose.reject(new Error('NoiseHandshake: SocketClosed'));
    }
}
