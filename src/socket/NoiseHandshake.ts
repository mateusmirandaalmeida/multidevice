import { Binary } from "../proto/Binary";
import { FrameSocket } from "./FrameSocket";
import { Resolvable } from "../utils/Resolvable";
import * as Crypto from "crypto";
import { extract, expand } from "../utils/HKDF";
import { NoiseSocket } from "./NoiseSocket";

const crypto = Crypto.webcrypto as any;

//var o = r(1136); // noisesocket
//var l = r(76770); // resolvable
var d = Promise.reject("UNINITIALIZED HANDSHAKE");
var u = new Uint8Array(0);

d.catch(() => {});

function c(e) {
  var t = new ArrayBuffer(12);
  return new DataView(t).setUint32(8, e), new Uint8Array(t);
}

function p(e, t = ["encrypt", "decrypt"]) {
  return crypto.subtle.importKey("raw", new Uint8Array(e), "AES-GCM", !1, t);
}

function f(e, t) {
  return extract(new Uint8Array(e), t)
    .then((e) => expand(new Uint8Array(e), "", 64))
    .then((e) => [e.slice(0, 32), e.slice(32)]);
}

function h(e) {
  e.catch(() => {});
}

export class NoiseHandshake {
  private hash: any;
  private salt: any;
  private cryptoKey: any;
  private counter = 0;
  private socket: FrameSocket;
  private rejectOnClose: any;

  constructor(socket: FrameSocket) {
    this.hash = d;
    this.salt = d;
    this.cryptoKey = d;
    this.counter = 0;
    this.socket = socket;
    this.rejectOnClose = new Resolvable();
    socket.onClose = () => {
      this.rejectOnClose.reject(new Error("NoiseHandshake: SocketClosed"));
    };

    h(this.rejectOnClose.promise);
  }

  start(e, t) {
    var r = Binary.build(e).readBuffer();
    var a =
      32 === r.byteLength
        ? Promise.resolve(r)
        : crypto.subtle.digest("SHA-256", r);

    (this.hash = a),
      (this.salt = a),
      (this.cryptoKey = a.then(p)),
      this.authenticate(t);
  }

  sendAndReceive(e) {
    var t = this.socket;
    var r = new Promise((r) => {
      t.onFrame = (e) => {
        t.onFrame = null;
        r(e);
      };
      t.sendFrame(e);
    });

    return this._orRejectOnClose(r);
  }

  send(e) {
    this.socket.sendFrame(e);
  }

  authenticate(e) {
    this.hash = Promise.all([this.hash, e]).then(([e, t]) => {
      var r = Binary.build(e, t).readByteArray();
      return crypto.subtle.digest("SHA-256", r);
    });
  }

  encrypt(e) {
    var t = this.counter++,
      r = Promise.all([this.cryptoKey, this.hash, e]).then(([e, r, a]) =>
        (function (e, t, r, a) {
          return crypto.subtle.encrypt(
            {
              name: "AES-GCM",
              iv: c(t),
              additionalData: r ? new Uint8Array(r) : u,
            },
            e,
            a
          );
        })(e, t, r, a)
      );
    return this.authenticate(r), this._orRejectOnClose(r);
  }

  decrypt(e) {
    var t = this.counter++,
      r = Promise.all([this.cryptoKey, this.hash]).then(([r, a]) =>
        (function (e, t, r, a) {
          return crypto.subtle.decrypt(
            {
              name: "AES-GCM",
              iv: c(t),
              additionalData: r ? new Uint8Array(r) : u,
            },
            e,
            a
          );
        })(r, t, a, e)
      );
    return this.authenticate(e), this._orRejectOnClose(r);
  }

  finish(): Promise<NoiseSocket> {
    var e = this.salt
      .then((e) => f(e, new Uint8Array(0)))
      .then(([e, t]) => Promise.all([p(e, ["encrypt"]), p(t, ["decrypt"])]))
      .then(([e, t]) => new NoiseSocket(this.socket, e, t));
    return this._orRejectOnClose(e);
  }

  mixIntoKey(e) {
    this.counter = 0;
    var t = Promise.all([this.salt, e]).then(([e, t]) =>
      f(e, new Uint8Array(t))
    );
    (this.salt = t.then((e) => e[0])),
      (this.cryptoKey = t.then((e) => p(e[1]))),
      h(this.salt),
      h(this.cryptoKey);
  }

  _orRejectOnClose(e) {
    return Promise.race([e, this.rejectOnClose.promise]).then((e) =>
      this.rejectOnClose.resolveWasCalled() ? this.rejectOnClose.promise : e
    );
  }
}
