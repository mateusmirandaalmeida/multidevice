(e,t,r)=>{
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.FrameSocket = t.SocketClosed = void 0;
    var a = r(81291);
    class i extends Error {
        constructor(e) {
            var t = "SocketClosed";
            super(null != e ? e : t),
            this.name = t
        }
    }
    t.SocketClosed = i;
    function n(e) {
        return !(e.size() < 3) && s(e) <= e.size()
    }
    function s(e) {
        return e.readUint8() << 16 | e.readUint16()
    }
    t.FrameSocket = class {
        constructor(e, t) {
            this._incoming = new a.Binary,
            this.closed = !1,
            this._draining = !1,
            this.onFrame = null,
            this.onClose = null,
            this._handleData = e=>{
                this._incoming.writeByteArray(e),
                this.convertBufferedToFrames()
            }
            ,
            this._handleClose = ()=>{
                if (this._incoming.peek(n))
                    return __LOG__(2)`FrameSocket closed, waiting for pending processing`,
                    void (this._draining = !0);
                this._doClose()
            }
            ,
            this._doClose = ()=>{
                if (!this.closed) {
                    __LOG__(2)`FrameSocket closed`,
                    this._draining = !1,
                    this.closed = !0;
                    var e = this.onClose;
                    e && e()
                }
            }
            ,
            this._handleError = e=>{
                __LOG__(4, void 0, new Error)`FrameSocket error ${e}`
            }
            ,
            this._introToSend = t,
            this._socket = e,
            e.onData = this._handleData,
            e.onClose = this._handleClose,
            e.onError = this._handleError
        }
        sendFrame(e) {
            if (!this._draining) {
                this.throwIfClosed();
                var t = this._introToSend
                  , r = e.byteLength
                  , a = this._socket.dataToSend;
                t ? (this._introToSend = null,
                a.ensureAdditionalCapacity(t.length + 3 + r),
                a.writeByteArray(t)) : a.ensureAdditionalCapacity(3 + r),
                a.writeUint8(r >> 16),
                a.writeUint16(65535 & r),
                a.write(e),
                this._socket.requestSend()
            }
        }
        convertBufferedToFrames() {
            for (var e = this._incoming, t = this.onFrame; t && e.peek(n); ) {
                var r = s(e);
                __LOG__(2)`FrameSocket.onFrame(${r} bytes)`,
                t(e.readByteArray(r)),
                t = this.onFrame
            }
            this._draining && !e.peek(n) && this._doClose(),
            t && e.size() && __LOG__(2)`FrameSocket: queueing partial frame of ${e.size()} bytes`
        }
        throwIfClosed() {
            if (this.closed)
                throw new i
        }
        close() {
            this._socket.close()
        }
    }
}