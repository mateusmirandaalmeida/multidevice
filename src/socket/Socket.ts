import { Binary } from "./../proto/Binary";
import WS from "ws";
import { DEFAULT_ORIGIN, WS_URL } from "./../utils/Utils";

export class Socket {
  public dataToSend: Binary;
  public conn: WS;
  public isConnected = false;

  public onData: Function;
  public onOpen: Function;
  public onClose: Function;
  public onError: Function;

  constructor() {
    this.dataToSend = new Binary();
  }

  public open() {
    this.conn = new WS(WS_URL, null, {
      origin: DEFAULT_ORIGIN,
      timeout: 60_000,
      headers: {
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Host: "web.whatsapp.com",
        Pragma: "no-cache",
        "Sec-WebSocket-Extensions":
          "permessage-deflate; client_max_window_bits",
        "Sec-WebSocket-Version": "13",
        "Upgrade": "websocket",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36"
      },
    });

    this.conn.binaryType = "arraybuffer";

    this.conn.onmessage = (e) => {
      if (!(e.data instanceof ArrayBuffer)) {
        throw new TypeError("expected ArrayBuffer from the socket");
      }
      const newData = new Uint8Array(e.data);
      console.warn("received msg", newData.byteLength);
      this.onData && this.onData(newData);
    };

    this.conn.onclose = (e) => {
      this.isConnected = false;
      console.log("closed");
      this.onClose && this.onClose(e);
    };

    this.conn.onopen = (e) => {
      this.isConnected = true;
      this.onOpen && this.onOpen(e);
    };

    this.conn.onerror = (e) => {
      this.onError && this.onError(e);
      console.log("err", e);
    };
  }

  public throwIfClosed() {
    if (this.isConnected) {
      return;
    }

    throw new Error("closed socket");
  }

  public close() {
    this.isConnected = false;
    this.conn.close();
  }

  public restart() {
    this.close();
    this.conn = null;

    this.open();
  }

  public requestSend() {
    this.throwIfClosed();

    if (!this.dataToSend.size()) {
      console.log("invalid size dataToSend");
      return;
    }

    try {
      console.log("SEND TO SERVER", this.dataToSend.size());
      this.conn.send(this.dataToSend.readByteArray());
    } catch (e) {
      console.log(`exception sending: ${e}\n${e.stack}`);
    }
  }
}
