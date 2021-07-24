(e,t,r)=>{
    "use strict";
    var a = r(7914);
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.makeWapNode = A,
    t.decodeAsString = function(e) {
        if (e instanceof o.WapJid)
            return e.toString();
        return e
    }
    ,
    t.makeStanza = P,
    t.encodeStanza = function(e) {
        var t = e instanceof T ? e : P(e)
          , r = new i.Binary;
        O(t, r);
        var a = r.readByteArray()
          , n = new Uint8Array(1 + a.length);
        return n[0] = 0,
        n.set(a, 1),
        n
    }
    ,
    t.decodeStanza = function(e, t) {
        var r = new i.Binary(e);
        if (2 & r.readUint8())
            return __LOG__(2)`Decoding compressed stanza`,
            t(r.readByteArray()).then((e=>U(new i.Binary(e))));
        return Promise.resolve(U(r))
    }
    ,
    t.generateId = function() {
        if (!m) {
            var e = new Uint16Array(2);
            self.crypto.getRandomValues(e),
            m = `${String(e[0])}.${String(e[1])}-`
        }
        return `${m}${g++}`
    }
    ,
    t.extractToJid = B,
    t.extractParticipantJid = function(e) {
        switch (e.type) {
        case "group":
        case "status":
        case "broadcast":
            return e.author;
        default:
            return e.type,
            null
        }
    }
    ,
    t.PARTICIPANT_JID = function(e) {
        return "status" === e.type || "group" === e.type || "broadcast" === e.type ? Y(e.author) : v
    }
    ,
    t.TO_JID = function(e) {
        return Y(B(e))
    }
    ,
    t.JID = Y,
    t.CUSTOM_STRING = function(e) {
        return e
    }
    ,
    t.MAYBE_CUSTOM_STRING = function(e) {
        if (null == e)
            return v;
        return e
    }
    ,
    t.INT = function(e) {
        return e.toString()
    }
    ,
    t.LONG_INT = function(e) {
        return (0,
        u.longIntToDecimalString)(e)
    }
    ,
    t.BIG_ENDIAN_CONTENT = function(e, t=4) {
        for (var r = e, a = new Uint8Array(t), i = t - 1; i >= 0; i--)
            a[i] = 255 & r,
            r >>>= 8;
        return a
    }
    ,
    t.wap = t.WapNode = t.S_WHATSAPP_NET = t.G_US = t.DROP_ATTR = void 0;
    var i = r(81291)
      , n = r(87936)
      , s = r(80542)
      , o = r(36788)
      , l = r(52838)
      , d = r(20840)
      , u = r(64709)
      , c = (a(r(92796)),
    [236, 237, 238, 239])
      , p = 248
      , f = 249
      , h = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", ".", "�", "�", "�", "�"]
      , _ = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"]
      , m = ""
      , g = 1
      , v = {
        sentinel: "DROP_ATTR"
    };
    t.DROP_ATTR = v;
    var y = o.WapJid.create(null, "g.us");
    t.G_US = y;
    var E = o.WapJid.create(null, "s.whatsapp.net");
    t.S_WHATSAPP_NET = E;
    var S = {};
    class T {
        constructor(e, t=S, r=null) {
            this.tag = e,
            this.attrs = t,
            this.content = r
        }
        toString() {
            var e = "<" + this.tag;
            e += (0,
            n.attrsToString)(this.attrs);
            var t = this.content;
            return Array.isArray(t) ? e += `>${t.map(String).join("")}</${this.tag}>` : e += t ? `>${(0,
            n.uint8ArrayToDebugString)(t)}</${this.tag}>` : " />",
            e
        }
    }
    function A(e, t, r) {
        var a = null;
        if (t && null != t.children)
            throw new Error('Children should not be passed via props (see eslint check "react/no-children-props")');
        if (Array.isArray(r))
            a = r.filter(Boolean);
        else if ("string" == typeof r)
            a = i.Binary.build(r).readByteArray();
        else if (r instanceof ArrayBuffer)
            a = new Uint8Array(r);
        else if (r instanceof Uint8Array)
            a = r;
        else {
            for (var n = [], s = 2; s < arguments.length; s++) {
                var o = arguments[s];
                o && n.push(o)
            }
            a = n
        }
        Array.isArray(a) && 0 === a.length && (a = null);
        var l = {};
        if (t) {
            var d = t;
            Object.keys(d).forEach((t=>{
                var r = d[t];
                if (null == r)
                    throw new Error(`Attr ${t} in <${e}> is null`);
                r !== v && (l[t] = r)
            }
            ))
        }
        return new T(e,l,a)
    }
    t.WapNode = T;
    var b, C = A;
    function P(e) {
        var t = e.content;
        return Array.isArray(t) ? t = t.map(P) : "string" == typeof t && (t = i.Binary.build(t).readByteArray()),
        new T(e.tag,e.attrs || S,t)
    }
    function O(e, t) {
        if (null == e)
            t.writeUint8(0);
        else if (e instanceof T)
            M(e, t);
        else if (e instanceof o.WapJid)
            !function(e, t) {
                var r = e.getInnerJid();
                if (r.type === o.WAP_JID_SUBTYPE.JID_AD) {
                    var {user: a, agent: i, device: n} = r;
                    t.writeUint8(247),
                    t.writeUint8(i),
                    t.writeUint8(n),
                    O(a, t)
                } else {
                    var {user: s, server: l} = r;
                    t.writeUint8(250),
                    null != s ? O(s, t) : t.writeUint8(0),
                    O(l, t)
                }
            }(e, t);
        else if ("string" == typeof e)
            R(e, t);
        else {
            if (!(e instanceof Uint8Array))
                throw new Error("Invalid payload type " + typeof e);
            !function(e, t) {
                N(e.length, t),
                t.writeByteArray(e)
            }(e, t)
        }
    }
    function M(e, t) {
        if (void 0 === e.tag)
            return t.writeUint8(p),
            void t.writeUint8(0);
        var r = 1;
        e.attrs && (r += 2 * Object.keys(e.attrs).length),
        e.content && r++,
        r < 256 ? (t.writeUint8(p),
        t.writeUint8(r)) : r < 65536 && (t.writeUint8(f),
        t.writeUint16(r)),
        O(e.tag, t),
        e.attrs && Object.keys(e.attrs).forEach((r=>{
            R(r, t),
            O(e.attrs[r], t)
        }
        ));
        var a = e.content;
        if (Array.isArray(a)) {
            a.length < 256 ? (t.writeUint8(p),
            t.writeUint8(a.length)) : a.length < 65536 && (t.writeUint8(f),
            t.writeUint16(a.length));
            for (var i = 0; i < a.length; i++)
                M(a[i], t)
        } else
            a && O(a, t)
    }
    t.wap = C;
    var w = null;
    function I(e) {
        for (var t = new Map, r = 0; r < e.length; r++)
            t.set(e[r], r);
        return t
    }
    function R(e, t) {
        if ("" === e)
            return t.writeUint8(252),
            void t.writeUint8(0);
        null == b && (b = I(l.SINGLE_BYTE_TOKEN));
        var r = b.get(e);
        if (null == r) {
            if (null == w) {
                w = [];
                for (var a = 0; a < l.DICTIONARIES.length; ++a)
                    w.push(I(l.DICTIONARIES[a]))
            }
            for (var n = 0; n < w.length; ++n) {
                var s = w[n].get(e);
                if (null != s)
                    return t.writeUint8(c[n]),
                    void t.writeUint8(s)
            }
            var o = (0,
            i.numUtf8Bytes)(e);
            if (o < 128) {
                if (!/[^0-9.-]+?/.exec(e))
                    return void D(e, 255, t);
                if (!/[^0-9A-F]+?/.exec(e))
                    return void D(e, 251, t)
            }
            N(o, t),
            t.writeString(e)
        } else
            t.writeUint8(r + 1)
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
    function L(e, t) {
        var r, a, i, n = e.readUint8();
        if (0 === n)
            return null;
        if (n === p)
            return k(e, e.readUint8());
        if (n === f)
            return k(e, e.readUint16());
        if (252 === n) {
            var s = e.readUint8();
            return F(e, s, t)
        }
        if (253 === n) {
            var d = e.readUint8()
              , u = e.readUint8()
              , c = e.readUint8();
            return F(e, ((15 & d) << 16) + (u << 8) + c, t)
        }
        if (254 === n) {
            var m = e.readUint32();
            return F(e, m, t)
        }
        if (250 === n)
            return a = function(e) {
                var t = L(e, !0);
                if (null != t && "string" != typeof t)
                    throw new Error(`Decode string got invalid value ${String(t)}, string expected`);
                return t
            }(r = e),
            i = G(r),
            o.WapJid.create(a, i);
        if (247 === n)
            return function(e) {
                var t = e.readUint8()
                  , r = e.readUint8()
                  , a = G(e);
                return o.WapJid.createAD(a, t, r)
            }(e);
        if (255 === n) {
            var g = e.readUint8();
            return x(e, h, g >>> 7, 127 & g)
        }
        if (251 === n) {
            var v = e.readUint8();
            return x(e, _, v >>> 7, 127 & v)
        }
        if (n <= 0 || n >= 240)
            throw new Error("Unable to decode WAP buffer");
        if (n >= 236 && n <= 239) {
            var y = n - 236
              , E = l.DICTIONARIES[y];
            if (void 0 === E)
                throw new Error(`Missing WAP dictionary ${y}`);
            var S = e.readUint8()
              , T = E[S];
            if (void 0 === T)
                throw new Error(`Invalid value index ${S} in dict ${y}`);
            return T
        }
        var A = l.SINGLE_BYTE_TOKEN[n - 1];
        if (void 0 === A)
            throw new Error(`Undefined token with index ${n}`);
        return A
    }
    function k(e, t) {
        for (var r = [], a = 0; a < t; a++)
            r.push(U(e));
        return r
    }
    function U(e) {
        var t, r = e.readUint8();
        if (r === p)
            t = e.readUint8();
        else {
            if (r !== f)
                throw new Error(`Failed to decode node since type byte ${String(r)} is invalid`);
            t = e.readUint16()
        }
        var a = void 0
          , i = null;
        if (0 === t)
            throw new Error("Failed to decode node, list cannot be empty");
        var n = G(e);
        for (t -= 1; t > 1; ) {
            a || (a = {});
            var s = G(e)
              , l = L(e, !0);
            a[s] = l,
            t -= 2
        }
        return 1 === t && (i = L(e, !1))instanceof o.WapJid && (i = String(i)),
        new T(n,a,i)
    }
    function G(e) {
        var t = L(e, !0);
        if ("string" != typeof t)
            throw new Error(`Decode string got invalid value ${String(t)}, string expected`);
        return t
    }
    function F(e, t, r=!1) {
        return r ? e.readString(t) : e.readByteArray(t)
    }
    function x(e, t, r, a) {
        for (var i = new Array(2 * a - r), n = 0; n < i.length - 1; n += 2) {
            var s = e.readUint8();
            i[n] = t[s >>> 4],
            i[n + 1] = t[15 & s]
        }
        if (r) {
            var o = e.readUint8();
            i[i.length - 1] = t[o >>> 4]
        }
        return i.join("")
    }
    function B(e) {
        switch (e.type) {
        case "group":
            return e.groupJid;
        case "status":
            return d.STATUS_JID;
        case "device":
            return e.deviceJid;
        default:
            return e.type,
            e.broadcastJid
        }
    }
    function Y(e) {
        var [t,r] = e.split("@")
          , a = null
          , i = null;
        return r === s.USER_JID_SUFFIX && (-1 !== t.indexOf(":") && ([t,i] = t.split(":"),
        i = parseInt(i, 10)),
        -1 !== t.indexOf(".") && ([t,a] = t.split("."),
        a = parseInt(a, 10))),
        null != i && 0 !== i || null != a && 0 !== a ? o.WapJid.createAD(t, a, i) : o.WapJid.create(t, r)
    }
}