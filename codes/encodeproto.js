(e,t,r)=>{
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.encodeProto = function(e, t, r=new a.Binary) {
        return (0,
        o.checkValid)(e, t),
        _(r, t, e),
        d = void 0,
        r
    }
    ,
    t.encodeErrorInfo = function() {
        return void 0 !== d ? `Last encoded value for ${d}` : "No information known"
    }
    ;
    var a = r(81291)
      , i = r(5781)
      , n = r(17126)
      , s = r(80736)
      , o = r(86043)
      , l = r(91579)
      , d = void 0;
    function u(e, t) {
        e.writeVarInt(t)
    }
    function c(e, t) {
        if ("number" == typeof t && t < 4503599627370496 && t >= -4503599627370496)
            e.writeVarInt(t >= 0 ? 2 * t : 2 * -t - 1);
        else {
            var r, i = new a.Binary;
            "number" == typeof t ? (r = t < 0,
            i.writeVarInt(r ? -t : t)) : (r = (0,
            l.hexLongIsNegative)(t),
            i.writeVarIntFromHexLong(r ? (0,
            l.negateHexLong)(t) : t));
            var n = i.peek((()=>i.readByteArray()))
              , s = n.byteLength;
            if (r) {
                var o, d = 0;
                do {
                    o = n[d],
                    n[d] = 128 & o | (127 & o) - 1 & 127,
                    d++
                } while (255 === n[d - 1])
            }
            for (var u = r ? 1 : 0, c = 0; c < s; c++) {
                var p = n[c]
                  , f = 128 & p | (63 & p) << 1 | u;
                u = (64 & p) >> 6,
                n[c] = f
            }
            1 === u && (n[s - 1] |= 128,
            i.writeInt8(1)),
            e.writeBinary(i)
        }
    }
    function p(e, t) {
        "number" == typeof t ? e.writeVarInt(t) : e.writeVarIntFromHexLong(t)
    }
    var f = [void 0, u, p, u, p, c, c, (e,t)=>{
        e.writeVarInt(t ? 1 : 0)
    }
    , u, (e,t)=>{
        "number" == typeof t ? e.writeUint64(t, !0) : e.writeHexLong(t, !0)
    }
    , (e,t)=>{
        "number" == typeof t ? e.writeInt64(t, !0) : e.writeHexLong(t, !0)
    }
    , (e,t)=>{
        e.writeFloat64(t, !0)
    }
    , function(e, t) {
        e.writeVarInt((0,
        a.numUtf8Bytes)(t)),
        e.writeString(t)
    }
    , function(e, t) {
        e.writeVarInt(t.byteLength),
        e.writeBuffer(t)
    }
    , function(e, t, r) {
        e.writeWithVarIntLength(((e,t)=>_(e, t, r)), t)
    }
    , (e,t)=>{
        e.writeUint32(t, !0)
    }
    , (e,t)=>{
        e.writeInt32(t, !0)
    }
    , (e,t)=>{
        e.writeFloat32(t, !0)
    }
    ]
      , h = f.map((e=>{
        if (null != e)
            return (e,r)=>{
                e.writeWithVarIntLength(t, r)
            }
            ;
        function t(t, r) {
            for (var a = 0; a < r.length; a++)
                e(t, r[a])
        }
    }
    ));
    function _(e, t, r) {
        for (var {names: a, fields: o, types: l, meta: u} = (0,
        i.compileSpec)(r), {internalDefaults: c} = r, p = 0; p < a.length; p++) {
            var _ = a[p]
              , m = t[_];
            if (void 0 === m && c && (m = c[_]),
            void 0 !== m) {
                d = _;
                var g = o[p]
                  , v = l[p]
                  , y = v & n.TYPE_MASK
                  , E = u[p]
                  , S = 8 * g | (0,
                s.typeToEncType)(v);
                if (v & n.FLAGS.PACKED) {
                    if (m.length > 0)
                        e.writeVarInt(S),
                        (0,
                        h[y])(e, m, E)
                } else if (v & n.FLAGS.REPEATED)
                    for (var T = 0; T < m.length; T++) {
                        e.writeVarInt(S),
                        (0,
                        f[y])(e, m[T], E)
                    }
                else {
                    e.writeVarInt(S),
                    (0,
                    f[y])(e, m, E)
                }
            }
        }
    }
}