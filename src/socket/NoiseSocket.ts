//var a = r(58328) // promisequeue
import { PromiseQueue } from "./../utils/PromiseQueue";
import * as Crypto from "crypto";
import { FrameSocket } from "./FrameSocket";

const crypto = Crypto.webcrypto as any;

let i = Promise.reject("UNINITIALIZED HANDSHAKE"),
  n = new Uint8Array(0);

i.catch(() => {});
function s(e) {
  var t = new ArrayBuffer(12);
  return new DataView(t).setUint32(8, e), new Uint8Array(t);
}

export class NoiseSocket {
  private incoming = [];
  private readQueue = new PromiseQueue();
  private sendQueue = new PromiseQueue();
  private readCounter = 0;
  private writeCounter = 0;
  private draining = false;
  private socket: FrameSocket;
  private writeKey: any;
  private readKey: any;
  public onClose: Function;
  public onFrame: Function;

  constructor(e: FrameSocket, t, r) {
    this.incoming = [];
    this.readCounter = 0;
    this.writeCounter = 0;
    this.draining = false;
   

    this.socket = e;
    this.writeKey = t;
    this.readKey = r;
    e.onFrame = this.handleCiphertext.bind(this);
    this.socket.onClose = this.handleOnClose.bind(this);
    e.convertBufferedToFrames();
  }

  handleCiphertext (e) {
    var t = this.readCounter++;
    this.readQueue.enqueueHandlers(
      (function (e, t, r, a) {
        return crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: s(t),
            additionalData: r ? new Uint8Array(r) : n,
          },
          e,
          a
        );
      })(this.readKey, t, void 0, e),
      this.handlePlaintext.bind(this)
    );
  };

  handleOnClose() {
    (this.draining = !0),
      this.readQueue.wait().then(() => {
        this.draining = !1;
        var e = this.onClose
        e && e();
      });
  };

  sendCiphertextFrame(e) {
    //this.socket.closed

    this.socket.sendFrame(e);
  }
    
  handlePlaintext (e) {
    this.onFrame ? this.onFrame(e) : this.incoming.push(e);
  };

  sendFrame(e) {
    if (!this.draining) {
      this.socket.throwIfClosed();
      var t,
        r,
        a,
        i,
        o = this.writeCounter++;
      this.sendQueue.enqueueHandlers(
        ((t = this.writeKey),
        (r = o),
        (a = void 0),
        (i = e),
        crypto.subtle.encrypt(
          {
            name: "AES-GCM",
            iv: s(r),
            additionalData: a ? new Uint8Array(a) : n,
          },
          t,
          i
        )),
        this.sendCiphertextFrame.bind(this)
      );
    }
  }
  setOnFrame(e) {
    this.onFrame = e;
  }
  setOnClose(e) {
    this.onClose = e;
  }
  close() {
    this.socket.close();
  }
}
