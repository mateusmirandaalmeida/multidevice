(e,t,r)=>{
    "use strict";
    var a = crypto;
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.keyPair = function(e) {
        var t;
        void 0 === e ? (t = new Uint8Array(32),
        self.crypto.getRandomValues(t)) : t = new Uint8Array(e);
        return t[0] &= 248,
        t[31] &= 127,
        t[31] |= 64,
        l({
            pubKey: 32,
            privKey: t,
            basepoint: i
        }, (function(e) {
            var r = a._curve25519_donna(e.pubKey, e.privKey, e.basepoint);
            if (r)
                throw new Error(`Curve25519:keyPair Error Code ${r}`);
            return {
                pubKey: o(e.pubKey, 32),
                privKey: t.buffer
            }
        }
        ))
    }
    ,
    t.sharedSecret = function(e, t) {
        return Promise.resolve().then((()=>l({
            sharedKey: 32,
            pubKey: e,
            privKey: t
        }, (function(e) {
            var t = a._curve25519_donna(e.sharedKey, e.privKey, e.pubKey);
            if (t)
                throw new Error(`Curve25519:sharedSecret Error Code ${t}`);
            return o(e.sharedKey, 32)
        }
        ))))
    }
    ,
    t.toSignalCurveKeyPair = function(e) {
        if (32 !== e.pubKey.byteLength || 32 !== e.privKey.byteLength)
            throw new Error("Invalid key pair type");
        var t = n(e.pubKey)
          , r = new Uint8Array(32);
        return r.set(new Uint8Array(e.privKey)),
        {
            pubKey: t,
            privKey: r.buffer
        }
    }
    ,
    t.toSignalCurvePubKey = n,
    t.toCurveKeyPair = function(e) {
        if (33 !== e.pubKey.byteLength || 32 !== e.privKey.byteLength)
            throw new Error("Invalid key pair type");
        var t = new Uint8Array(32)
          , r = new Uint8Array(32);
        return t.set(new Uint8Array(e.pubKey).subarray(1)),
        r.set(new Uint8Array(e.privKey)),
        {
            pubKey: t.buffer,
            privKey: r.buffer
        }
    }
    ,
    t.toCurveKeyPubKey = function(e) {
        if (33 !== e.byteLength)
            throw new Error("Invalid key type");
        var t = new Uint8Array(32);
        return t.set(new Uint8Array(e).subarray(1)),
        t.buffer
    }
    ,
    t.verifySignature = function(e, t, r) {
        if (32 !== e.byteLength)
            throw new Error(`Invalid public key length: ${e.byteLength}`);
        var a = new Uint8Array(33);
        return a[0] = 5,
        a.set(e, 1),
        !1 === window.libsignal.Curve.verifySignature(a, t, r)
    }
    ;
    var i = new Uint8Array(32);
    i[0] = 9;
    function n(e) {
        if (32 !== e.byteLength)
            throw new Error("Invalid key type");
        var t = new Uint8Array(33);
        return t[0] = 5,
        t.set(new Uint8Array(e), 1),
        t.buffer
    }
    function s(e) {
        if ("number" == typeof e)
            return a._malloc(e);
        var t = new Uint8Array(e.buffer || e)
          , r = a._malloc(t.length);
        return a.HEAPU8.set(t, r),
        r
    }
    function o(e, t) {
        var r = new Uint8Array(t);
        return r.set(a.HEAPU8.subarray(e, e + t)),
        r.buffer
    }
    function l(e, t) {
        a || (a = r(23098));
        var i = {};
        try {
            for (var n in e)
                i[n] = s(e[n]);
            return t(i)
        } finally {
            for (var o in i)
                a._free(i[o])
        }
    }
}