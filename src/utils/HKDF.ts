import * as Crypto from "crypto";
import { Binary } from "./../proto/Binary";

const crypto = Crypto.webcrypto as any;

var i = new Uint8Array(32),
  n = {
    name: "HMAC",
    hash: "SHA-256",
  };

function s(e) {
  return crypto.subtle.importKey("raw", e, n, !1, ["sign"]);
}
function o(e, t) {
  return crypto.subtle.sign(n, e, t);
}
function l(e, t) {
  return s(e || i).then((e) => o(e, t));
}
function d(e, t, r) {
  if (r < 0 || r > 8160)
    return Promise.reject(new Error(`HKDF::expand given bad length ${r}`));
  for (
    var i,
      n = Math.ceil(r / 32),
      l = Binary.build(t).readByteArray(),
      d = new Binary(),
      u = s(e).then((e) => ((i = e), new Uint8Array(0))),
      c = function (e) {
        u = u
          .then((t) => o(i, Binary.build(t, l, e).readByteArray()))
          .then((e) => {
            var t = new Uint8Array(e);
            return d.writeByteArray(t), t;
          });
      },
      p = 1;
    p <= n;
    p++
  )
    c(p);
  return u.then(() => d.readBuffer(r));
}

export const hmacSha256 = function (e, t) {
  return s(e).then((e) => o(e, t));
};

export const extract = l;
export const expand = d;
export const extractAndExpand = function (e, t, r) {
  return l(null, e).then((e) => d(new Uint8Array(e), t, r));
};

export const extractWithSaltAndExpand = function (e, t, r, a) {
  return l(t, e).then((e) => d(new Uint8Array(e), r, a));
};
