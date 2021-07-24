import { Binary } from "./../proto/Binary";
import { Socket } from "./Socket";

function n(e) {
  return !(e.size() < 3) && s(e) <= e.size()
}
function s(e) {
  return e.readUint8() << 16 | e.readUint16()
}
export class FrameSocket {
  private socket: Socket;
  private incoming = new Binary();
  private closed = false;
  private draining = false;
  public onFrame = null;
  public onClose = null;

  private introToSend: any;

  constructor(socket: Socket, introToSend) {
    this.incoming = new Binary();
    this.closed = false;
    this.draining = false;
    this.onFrame = null;
    this.onClose = null;

    this.introToSend = introToSend;
    this.socket = socket;

    socket.onData = this.handleData.bind(this);
    socket.onClose = this.handleClose.bind(this);
    socket.onError = this.handleError.bind(this);
  }

  handleData(e) {
    this.incoming.writeByteArray(e), this.convertBufferedToFrames();
  }

  handleClose() {
    if (this.incoming.peek(n))
      return (
        console.log("FrameSocket closed, waiting for pending processing"),
        void (this.draining = !0)
      );
    this.doClose();
  }

  doClose() {
    if (!this.closed) {
      console.log("FrameSocket closed"),
        (this.draining = !1),
        (this.closed = !0);
      var e = this.onClose;
      e && e();
    }
  }

  handleError(e) {
    console.log("frame socket error", e);
  }

  sendFrame(e: Uint8Array) {
    if (!this.draining) {
      this.throwIfClosed();
      var t = this.introToSend
        , r = e.byteLength
        , a = this.socket.dataToSend;
      t ? (this.introToSend = null,
      a.ensureAdditionalCapacity(t.length + 3 + r),
      a.writeByteArray(t)) : a.ensureAdditionalCapacity(3 + r),
      a.writeUint8(r >> 16),
      a.writeUint16(65535 & r),
      a.write(e),
      this.socket.requestSend()
    }
  }

  convertBufferedToFrames() {
    for (var e = this.incoming, t = this.onFrame; t && e.peek(n); ) {
        var r = s(e);
        console.log(`FrameSocket.onFrame(${r} bytes)`),
        t(e.readByteArray(r)),
        t = this.onFrame
    }
    this.draining && !e.peek(n) && this.doClose(),
    t && e.size() && console.log(`FrameSocket: queueing partial frame of ${e.size()} bytes`)
  }

  throwIfClosed() {
    if (this.closed) throw new Error("closed");
  }

  close() {
    this.socket.close();
  }
}
