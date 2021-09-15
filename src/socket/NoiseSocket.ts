import { PromiseQueue } from '../utils/PromiseQueue';
import { FrameSocket } from './FrameSocket';
import * as Crypto from 'crypto';

const crypto = Crypto.webcrypto as any;

export class NoiseSocket {
    private incoming: ArrayBuffer[] = [];
    private readQueue = new PromiseQueue();
    private sendQueue = new PromiseQueue();
    private readCounter = 0;
    private writeCounter = 0;
    private draining = false;
    private socket: FrameSocket;
    private writeKey: Uint8Array;
    private readKey: Uint8Array;
    public onClose: Function;
    public onFrame: Function;

    constructor(socket: FrameSocket, writeKey: Uint8Array, readKey: Uint8Array) {
        this.incoming = [];
        this.readCounter = 0;
        this.writeCounter = 0;
        this.draining = false;

        this.socket = socket;
        this.writeKey = writeKey;
        this.readKey = readKey;

        this.socket.onFrame = this.handleCiphertext.bind(this);
        this.socket.onClose = this.handleOnClose.bind(this);

        socket.convertBufferedToFrames();
    }

    public async sendCiphertextFrame(data: Uint8Array) {
        this.socket.throwIfClosed();

        return this.socket.sendFrame(data);
    }

    public sendFrame(data: Uint8Array) {
        if (this.draining) {
            return;
        }

        this.socket.throwIfClosed();

        const currCount = this.writeCounter++;
        return this.sendQueue.enqueueHandlers(
            crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: this.generateIv(currCount),
                    additionalData: new Uint8Array(0),
                },
                this.writeKey,
                data,
            ),
            this.sendCiphertextFrame.bind(this)
        );
    }

    public setOnFrame(cb: Function) {
        this.onFrame = cb;
    }

    public setOnClose(cb: Function) {
        this.onClose = cb;
    }

    public close() {
        this.socket.close();
    }

    public restart() {
        this.socket.restart();
    }

    private handlePlaintext(data: ArrayBuffer) {
        this.onFrame ? this.onFrame(data) : this.incoming.push(data);
    }

    private handleCiphertext(data: Uint8Array) {
        const currCount = this.readCounter++;
        this.readQueue.enqueueHandlers(
            crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: this.generateIv(currCount),
                    additionalData: new Uint8Array(0),
                },
                this.readKey,
                data,
            ),
            this.handlePlaintext.bind(this),
        );
    }

    private async handleOnClose() {
        this.draining = true;
        await this.readQueue.wait();
        this.draining = false;
        if (this.onClose) {
            this.onClose();
        }
    }

    private generateIv(count: number) {
        const iv = new ArrayBuffer(12);
        new DataView(iv).setUint32(8, count);

        return new Uint8Array(iv);
    }
}
