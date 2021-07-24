(e,t,r)=>{
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.NoiseSocket = void 0;
    var a = r(58328)
      , i = Promise.reject("UNINITIALIZED HANDSHAKE")
      , n = new Uint8Array(0);
    i.catch((()=>{}
    ));
    function s(e) {
        var t = new ArrayBuffer(12);
        return new DataView(t).setUint32(8, e),
        new Uint8Array(t)
    }
    t.NoiseSocket = class {
        constructor(e, t, r) {
            this._incoming = [],
            this._readQueue = new a.PromiseQueue,
            this._sendQueue = new a.PromiseQueue,
            this._readCounter = 0,
            this._writeCounter = 0,
            this._draining = !1,
            this._sendCiphertextFrame = e=>{
                this._socket.closed ? __LOG__(2)`NoiseSocket socket closed while encrypting frame` : this._socket.sendFrame(e)
            }
            ,
            this._handleCiphertext = e=>{
                var t = this._readCounter++;
                this._readQueue.enqueueHandlers(function(e, t, r, a) {
                    return self.crypto.subtle.decrypt({
                        name: "AES-GCM",
                        iv: s(t),
                        additionalData: r ? new Uint8Array(r) : n
                    }, e, a)
                }(this._readKey, t, void 0, e), this._handlePlaintext)
            }
            ,
            this._handleOnClose = ()=>{
                this._draining = !0,
                this._readQueue.wait().then((()=>{
                    this._draining = !1;
                    var e = this._onClose;
                    e && e()
                }
                ))
            }
            ,
            this._handlePlaintext = e=>{
                this._onFrame ? this._onFrame(e) : this._incoming.push(e)
            }
            ,
            this._socket = e,
            this._writeKey = t,
            this._readKey = r,
            e.onFrame = this._handleCiphertext,
            this._socket.onClose = this._handleOnClose,
            e.convertBufferedToFrames()
        }
        sendFrame(e) {
            if (!this._draining) {
                this._socket.throwIfClosed();
                var t, r, a, i, o = this._writeCounter++;
                this._sendQueue.enqueueHandlers((t = this._writeKey,
                r = o,
                a = void 0,
                i = e,
                self.crypto.subtle.encrypt({
                    name: "AES-GCM",
                    iv: s(r),
                    additionalData: a ? new Uint8Array(a) : n
                }, t, i)), this._sendCiphertextFrame)
            }
        }
        setOnFrame(e) {
            this._onFrame = e
        }
        setOnClose(e) {
            this._onClose = e
        }
        close() {
            this._socket.close()
        }
    }
}