(e,t,r)=>{
    "use strict";
    var a = r(7914);
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.decodeProto = function(e, t) {
        var r = new n.Binary(t)
          , a = g(e, r, void 0, !1);
        return (0,
        d.checkRequirements)(e, a),
        a
    }
    ,
    t.decodeProtoWithUnknowns = function(e, t) {
        var r = new n.Binary(t)
          , a = g(e, r, void 0, !0);
        return (0,
        d.checkRequirements)(e, a),
        a
    }
    ,
    t.getUnknownFields = function(e) {
        return Object.prototype.hasOwnProperty.call(e, "unsafeUnknownFields") ? e.unsafeUnknownFields : null
    }
    ;
    var i = a(r(73982))
      , n = r(81291)
      , s = r(5781)
      , o = r(17126)
      , l = r(80736)
      , d = r(86043)
      , u = r(91579);
    function c(e, t, r) {
        if (e !== (0,
        l.typeToEncType)(t))
            throw new Error(`FormatError: ${r} encoded with wire type ${e}`)
    }
    function p(e, t, r) {
        switch (t) {
        case o.TYPES.INT32:
            return f(r, -2147483648, 2147483648, e, n.parseInt64OrThrow);
        case o.TYPES.INT64:
            return r.readVarInt(h);
        case o.TYPES.UINT32:
            return f(r, 0, 4294967296, e, n.parseUint64OrThrow);
        case o.TYPES.UINT64:
            return r.readVarInt(_);
        case o.TYPES.SINT32:
            var a = f(r, 0, 4294967296, e, n.parseInt64OrThrow);
            return 1 & a ? ~(a >>> 1) : a >>> 1;
        case o.TYPES.SINT64:
            return r.readVarInt(m);
        case o.TYPES.BOOL:
            return !!f(r, 0, 2, e, n.parseUint64OrThrow);
        case o.TYPES.ENUM:
            return r.readVarInt(n.parseInt64OrThrow);
        case o.TYPES.FIXED64:
            return r.readLong(_, !0);
        case o.TYPES.SFIXED64:
            return r.readLong(h, !0);
        case o.TYPES.DOUBLE:
            return r.readFloat64(!0);
        case o.TYPES.STRING:
            return r.readString(r.readVarInt(n.parseUint64OrThrow));
        case o.TYPES.BYTES:
            return r.readBuffer(r.readVarInt(n.parseUint64OrThrow));
        case o.TYPES.FIXED32:
            return r.readUint32(!0);
        case o.TYPES.SFIXED32:
            return r.readInt32(!0);
        case o.TYPES.FLOAT:
            return r.readFloat32(!0)
        }
    }
    function f(e, t, r, a, i) {
        var n = e.readVarInt(i);
        if (n < t || n >= r)
            throw new Error(`FormatError: ${a} encoded with out-of-range value ${n}`);
        return n
    }
    function h(e, t) {
        if ((0,
        n.longFitsInDouble)(!0, e, t))
            return 4294967296 * e + v(t);
        var r, a = e < 0;
        r = a ? 0 === t ? -e : ~e : e;
        var i = a ? -t : t;
        return (0,
        u.createHexLongFrom32Bits)(r, i, a)
    }
    function _(e, t) {
        return (0,
        n.longFitsInDouble)(!1, e, t) ? 4294967296 * v(e) + v(t) : (0,
        u.createHexLongFrom32Bits)(e, t)
    }
    function m(e, t) {
        var r = e >>> 1
          , a = e << 31 | t >>> 1;
        return 1 & t && (r = ~r,
        a = ~a),
        h(r, a)
    }
    function g(e, t, r, a) {
        for (var {names: l, fields: d, types: u, meta: h, oneofToFields: _, fieldToOneof: m, reservedTags: v, reservedFields: y} = (0,
        s.compileSpec)(e), {internalDefaults: E} = e, S = r || (0,
        i.default)({}, E) || {}, T = 0; T < l.length; T++)
            u[T] & o.FLAGS.REPEATED && (S[l[T]] = []);
        for (var A = 0, b = d[0]; t.size(); ) {
            var C = f(t, 0, 4294967296, "field and enc type", n.parseInt64OrThrow)
              , P = 7 & C
              , O = C >>> 3;
            if (O !== b) {
                var M = A;
                do {
                    ++A === d.length && (A = 0),
                    b = d[A]
                } while (O !== b && A !== M)
            }
            if (O === b)
                !function() {
                    var e = l[A]
                      , r = u[A];
                    c(P, r, e);
                    var i = r & o.TYPE_MASK
                      , s = h[A];
                    if (r & o.FLAGS.PACKED)
                        for (var d = t.readVarInt(n.parseUint64OrThrow), f = t.readBinary(d); f.size(); ) {
                            var E = p(e, i, f);
                            (i !== o.TYPES.ENUM || s[E] || void 0 !== s.cast(E)) && S[e].push(E)
                        }
                    else if (i === o.TYPES.MESSAGE) {
                        var T = t.readVarInt(n.parseUint64OrThrow)
                          , b = t.readBinary(T);
                        if (r & o.FLAGS.REPEATED)
                            S[e].push(g(s, b, void 0, a));
                        else {
                            var C = S[e];
                            S[e] = g(s, b, C, a)
                        }
                    } else {
                        var M = p(e, i, t);
                        (i !== o.TYPES.ENUM || s[M] || void 0 !== s.cast(M)) && (r & o.FLAGS.REPEATED ? S[e].push(M) : S[e] = M)
                    }
                    var w = m[e];
                    w && void 0 !== S[e] && w.forEach((t=>{
                        _[t].filter((t=>t !== e)).forEach((e=>{
                            delete S[e]
                        }
                        ))
                    }
                    )),
                    (v[O] || y[e]) && delete S[e]
                }();
            else if (a) {
                S.unsafeUnknownFields || (S.unsafeUnknownFields = {});
                var w = void 0;
                switch (P) {
                case o.ENC.VARINT:
                    w = t.readVarInt(n.parseInt64OrThrow);
                    break;
                case o.ENC.BIT64:
                    w = t.readBinary(8);
                    break;
                case o.ENC.BINARY:
                    w = t.readBinary(t.readVarInt(n.parseUint64OrThrow));
                    break;
                case o.ENC.BIT32:
                    w = t.readBinary(4)
                }
                S.unsafeUnknownFields[O] = w
            } else
                P === o.ENC.VARINT ? t.readVarInt(n.parseInt64OrThrow) : P === o.ENC.BIT64 ? t.advance(8) : P === o.ENC.BINARY ? t.advance(t.readVarInt(n.parseUint64OrThrow)) : P === o.ENC.BIT32 && t.advance(4)
        }
        return S
    }
    function v(e) {
        return e >= 0 ? e : 4294967296 + e
    }
}