import { DICTIONARIES_MAP, randomBytes, SINGLE_BYTE_TOKEN, SINGLE_BYTE_TOKEN_MAP } from "../utils/Utils";
import { WapJid } from "./WapJid";
import { DICTIONARIES } from "./../utils/Utils";
import { WapNode } from "./WapNode";
import { Binary, numUtf8Bytes } from './Binary';

const LIST1 = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "-",
  ".",
  "�",
  "�",
  "�",
  "�",
];
const LIST2 = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
];

function k(data: Binary, uint: number) {
  let arr = [];
  for (let a = 0; a < uint; a++) {
    arr.push(decodeStanza(data));
  }
  return arr;
}

function x(data: Binary, t, r, a) {
  const arr = new Array(2 * a - r);
  for (let n = 0; n < arr.length - 1; n += 2) {
    var s = data.readUint8();
    (arr[n] = t[s >>> 4]), (arr[n + 1] = t[15 & s]);
  }

  if (r) {
    arr[arr.length - 1] = t[data.readUint8() >>> 4];
  }

  return arr.join("");
}

function D(e, t, r) {
  var a = e.length % 2 == 1;
  r.writeUint8(t);
  var i = Math.ceil(e.length / 2);
  a && (i |= 128),
  r.writeUint8(i);
  for (var n = 0, s = 0; s < e.length; s++) {
      var o = e.charCodeAt(s)
        , l = null;
      if (48 <= o && o <= 57 ? l = o - 48 : 255 === t ? 45 === o ? l = 10 : 46 === o && (l = 11) : 251 === t && 65 <= o && o <= 70 && (l = o - 55),
      null == l)
          throw new Error(`Cannot nibble encode ${o}`);
      s % 2 == 0 ? (n = l << 4,
      s === e.length - 1 && (n |= 15,
      r.writeUint8(n))) : (n |= l,
      r.writeUint8(n))
  }
}

function N(e, t) {
  if (e < 256)
      t.writeUint8(252),
      t.writeUint8(e);
  else if (e < 1048576)
      t.writeUint8(253),
      t.writeUint8(e >>> 16 & 255),
      t.writeUint8(e >>> 8 & 255),
      t.writeUint8(255 & e);
  else {
      if (!(e < 4294967296))
          throw new Error(`Binary with length ${e} is too big for WAP protocol`);
      t.writeUint8(254),
      t.writeUint32(e)
  }
}

function R(node: any, data: Binary) {
  if (node == "") {
    data.writeUint8(252);
    data.writeUint8(0);

    return;
  }

  const r = SINGLE_BYTE_TOKEN_MAP.get(node);
  if (r == null) {
    const DICT_INDEX = [236, 237, 238, 239];
    for (let index = 0; index < DICTIONARIES_MAP.length; index++) {
      const s = DICTIONARIES_MAP[index].get(node);
      if (s != null) {
        data.writeUint8(DICT_INDEX[index]);
        data.writeUint8(s);
        return;
      }
    }

    const numBytes = numUtf8Bytes(node);
    if (numBytes < 128) {
      if (!/[^0-9.-]+?/.exec(node)) {
        D(node, 255, data);
        return;
      }

      if (!/[^0-9A-F]+?/.exec(node)) {
        D(node, 251, data);
        return;
      }
    }

    N(numBytes, data);
    data.writeString(node);
    return;
  }

  data.writeUint8(r + 1);
}

function aM(node, data) {
  if (node?.tag == undefined) {
    data.writeUint8(248);
    data.writeUint8(0);

    return;
  }

  var r = 1;
  node.attrs && (r += 2 * Object.keys(node.attrs).length),
  node.content && r++,
  r < 256 ? (data.writeUint8(248),
  data.writeUint8(r)) : r < 65536 && (data.writeUint8(249),
  data.writeUint16(r)),
  O(node.tag, data),
  node.attrs && Object.keys(node.attrs).forEach((r=>{
      R(r, data),
      O(node.attrs[r], data)
  }
  ));
  var a = node.content;
  if (Array.isArray(a)) {
      a.length < 256 ? (data.writeUint8(248),
      data.writeUint8(a.length)) : a.length < 65536 && (data.writeUint8(249),
      data.writeUint16(a.length));
      for (var i = 0; i < a.length; i++)
          M(a[i], data)
  } else
      a && O(a, data)
}

function M(node: any, data: Binary) {
  if (node?.tag == undefined) {
    data.writeUint8(248);
    data.writeUint8(0);

    return;
  }

  let attrsLength = 1;
  if (node.attrs) {
    attrsLength += 2 * Object.keys(node.attrs).length;
  }

  if (node.content) {
    attrsLength++;
  }

  if (attrsLength < 256) {
    data.writeUint8(248);
    data.writeUint8(attrsLength);
  }

  if (attrsLength > 256 && attrsLength < 65536) {
    data.writeUint8(249);
    data.writeUint16(attrsLength);
  }
      
  O(node.tag, data);

  if (node.attrs) {
    Object.keys(node.attrs).forEach(key => {
      R(key, data);
      O(node.attrs[key], data);
    });
  }
  
  if (Array.isArray(node.content)) {
    if (node.content.length < 256) {
      data.writeUint8(248);
      data.writeUint8(node.content.length);
    }

    if (node.content.length > 256 && node.content.length < 65536) {
      data.writeUint8(249);
      data.writeUint16(node.content.length);
    }

    for (let i = 0; i < node.content.length; i++) {
      M(node.content[i], data)
    }
    return;
  }

  if (!node.content) {
    return;
  }

  return O(node.content, data);
}

function L(data: Binary, t: boolean) {
  const n = data.readUint8();
  if (n === 0) {
    return null;
  }

  if (n === 248) {
    return k(data, data.readUint8());
  }

  if (n === 249) {
    return k(data, data.readUint16());
  }

  if (n === 252) {
    return t
      ? data.readString(data.readUint8())
      : data.readByteArray(data.readUint8());
  }

  if (n === 253) {
    const size =
      ((15 & data.readUint8()) << 16) +
      (data.readUint8() << 8) +
      data.readUint8();
    return t ? data.readString(size) : data.readByteArray(size);
  }

  if (n === 254) {
    return t
      ? data.readString(data.readUint32())
      : data.readByteArray(data.readUint32());
  }

  if (n === 250) {
    const user = L(data, true);
    if (typeof t != "string" && user != null) {
      throw new Error(
        `Decode string got invalid value ${String(user)}, string expected`
      );
    }

    const server = decodeStanzaString(data);
    return WapJid.create(user, server);
  }

  if (n === 247) {
    const agent = data.readUint8();
    const device = data.readUint8();
    const user = decodeStanzaString(data);

    return WapJid.createAD(user, agent, device);
  }

  if (n === 255) {
    const number = data.readUint8();
    return x(data, LIST1, number >>> 7, 127 & number);
  }

  if (n === 251) {
    const number = data.readUint8();
    return x(data, LIST2, number >>> 7, 127 & number);
  }

  if (n <= 0 || n >= 240) {
    throw new Error("Unable to decode WAP buffer");
  }

  if (n >= 236 && n <= 239) {
    const dict = DICTIONARIES[n - 236];
    if (!dict) {
      throw new Error(`Missing WAP dictionary ${n - 236}`);
    }

    const index = data.readUint8();
    const value = dict[index];
    if (!value) {
      throw new Error(`Invalid value index ${index} in dict ${n - 236}`);
    }

    return value;
  }

  const singleToken = SINGLE_BYTE_TOKEN[n - 1];
  if (!singleToken) throw new Error(`Undefined token with index ${n}`);

  return singleToken;
}

function O(node: any, data: Binary) {
  if (data == null) {
    data.writeUint8(0);
    return;
  }

  if (node instanceof WapNode) {
    M(node, data);
    return;
  }

  if (node instanceof WapJid) {
    const jid = node.getInnerJid();
    if (jid.type == WapJid.JID_AD) {
      data.writeUint8(247);
      data.writeUint8(jid.agent);
      data.writeUint8(jid.device);

      return O(jid.user, data);
    }

    if (jid.type == WapJid.JID) {
      data.writeUint8(250);
      if (jid.user != null) {
        return O(jid.user, data);
      }

      data.writeUint8(0);
      return O(jid.server, data);
    }
  }
  
  if (typeof node == 'string') {
    return R(node, data);
  }

  
  if (!(node instanceof Uint8Array)) {
    throw new Error("Invalid payload type " + typeof node);
  }

  N(node.length, data);
  data.writeByteArray(node);
}

function decodeStanzaString(data: Binary) {
  // G
  const t = L(data, true);
  if (typeof t != "string") {
    throw new Error(
      `Decode string got invalid value ${String(t)}, string expected`
    );
  }

  return t;
}

export const decodeStanza = (data: Binary) => {
  //U
  let r = data.readUint8();
  let t = r === 248 ? data.readUint8() : data.readUint16();

  if (!t) {
    throw new Error("Failed to decode node, list cannot be empty");
  }

  const a = {};

  const n = decodeStanzaString(data);
  for (t -= 1; t > 1; ) {
    const s = decodeStanzaString(data);
    const l = L(data, true);
    a[s] = l;
    t -= 2;
  }

  let i = null;
  return (
    1 === t && (i = L(data, !1)) instanceof WapJid && (i = String(i)),
    new WapNode(n, a, i)
  );
};

export const buildWapNode = (e: any) => {
  /*var t = e.content;
  return (
    Array.isArray(t)
      ? (t = t.map(P))
      : "string" == typeof t && (t = i.Binary.build(t).readByteArray()),
    new T(e.tag, e.attrs || S, t)
  );*/

  let content: any = e.content;
  if (Array.isArray(e.content)) {
    content = e.content.map(buildWapNode);
  }

  if (typeof e.content == 'string') {
    content = Binary.build(e.content).readByteArray();
  }

  return new WapNode(e.tag, e.attrs || {}, content);
};

export const encodeStanza = (e) => {
  const node = e instanceof WapNode ? e : buildWapNode(e);

  const data = new Binary();

  O(node, data);

  const dataArr = data.readByteArray();
  const result = new Uint8Array(1 + dataArr.length);

  result[0] = 0;
  result.set(dataArr, 1);

  return result;
};

let ID_COUNT = 1;
let UNIQUE_ID = null;

export const generateId = function() {
  if (!UNIQUE_ID) {
      const e = new Uint16Array(randomBytes(2));
      UNIQUE_ID = `${String(e[0])}.${String(e[1])}-`;
  }

  return `${UNIQUE_ID}${ID_COUNT++}`;
}