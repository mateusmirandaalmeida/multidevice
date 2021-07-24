import { compileSpec, SPEC_CONSTS } from "./Spec";
import { Binary, numUtf8Bytes } from './Binary';
import { hexLongIsNegative, negateHexLong } from "./../utils/HexHelper";

export const typeToEncType = function (e) {
  if (e & SPEC_CONSTS.FLAGS.PACKED) return SPEC_CONSTS.ENC.BINARY;
  var t = e & SPEC_CONSTS.TYPE_MASK;
  return t <= SPEC_CONSTS.TYPES.ENUM
    ? SPEC_CONSTS.ENC.VARINT
    : t <= SPEC_CONSTS.TYPES.DOUBLE
    ? SPEC_CONSTS.ENC.BIT64
    : t <= SPEC_CONSTS.TYPES.MESSAGE
    ? SPEC_CONSTS.ENC.BINARY
    : SPEC_CONSTS.ENC.BIT32;
};

function u(e, t) {
  e.writeVarInt(t);
}

/*var a = r(81291) // binary
      , i = r(5781) // spec
      , n = r(17126) // spec consts
      , s = r(80736) // typeToEncType
      , o = r(86043) // validator
      , l = r(91579) // hexhelper */
      
      
var d = void 0;

function c(e, t) {
  if ("number" == typeof t && t < 4503599627370496 && t >= -4503599627370496)
    e.writeVarInt(t >= 0 ? 2 * t : 2 * -t - 1);
  else {
    var r,
      i = new Binary();
    "number" == typeof t
      ? ((r = t < 0), i.writeVarInt(r ? -t : t))
      : ((r = hexLongIsNegative(t)),
        i.writeVarIntFromHexLong(r ? negateHexLong(t) : t));
    var n = i.peek(() => i.readByteArray()),
      s = n.byteLength;
    if (r) {
      var o,
        d = 0;
      do {
        (o = n[d]), (n[d] = (128 & o) | (((127 & o) - 1) & 127)), d++;
      } while (255 === n[d - 1]);
    }
    for (var u = r ? 1 : 0, c = 0; c < s; c++) {
      var p = n[c],
        f = (128 & p) | ((63 & p) << 1) | u;
      (u = (64 & p) >> 6), (n[c] = f);
    }
    1 === u && ((n[s - 1] |= 128), i.writeInt8(1)), e.writeBinary(i);
  }
}
function p(e, t) {
  "number" == typeof t ? e.writeVarInt(t) : e.writeVarIntFromHexLong(t);
}
var f = [
    void 0,
    u,
    p,
    u,
    p,
    c,
    c,
    (e, t) => {
      e.writeVarInt(t ? 1 : 0);
    },
    u,
    (e, t) => {
      "number" == typeof t ? e.writeUint64(t, !0) : e.writeHexLong(t, !0);
    },
    (e, t) => {
      "number" == typeof t ? e.writeInt64(t, !0) : e.writeHexLong(t, !0);
    },
    (e, t) => {
      e.writeFloat64(t, !0);
    },
    function (e, t) {
      e.writeVarInt(numUtf8Bytes(t)), e.writeString(t);
    },
    function (e, t) {
      e.writeVarInt(t.byteLength), e.writeBuffer(t);
    },
    function (e, t, r = undefined) {
      e.writeWithVarIntLength((e, t) => _(e, t, r), t);
    },
    (e, t) => {
      e.writeUint32(t, !0);
    },
    (e, t) => {
      e.writeInt32(t, !0);
    },
    (e, t) => {
      e.writeFloat32(t, !0);
    },
  ],
  h = f.map((e) => {
    if (null != e)
      return (e, r) => {
        e.writeWithVarIntLength(t, r);
      };
    function t(t, r) {
      for (var a = 0; a < r.length; a++) e(t, r[a]);
    }
  });

function _(e, t, r) {
  for (
    var { names: a, fields: o, types: l, meta: u } = compileSpec(r),
      { internalDefaults: c } = r,
      p = 0;
    p < a.length;
    p++
  ) {
    var _ = a[p],
      m = t[_];
    if ((void 0 === m && c && (m = c[_]), void 0 !== m)) {
      d = _;
      var g = o[p],
        v = l[p],
        y = v & SPEC_CONSTS.TYPE_MASK,
        E = u[p],
        S = (8 * g) | typeToEncType(v);
      if (v & SPEC_CONSTS.FLAGS.PACKED) {
        if (m.length > 0) e.writeVarInt(S), h[y](e, m);
      } else if (v & SPEC_CONSTS.FLAGS.REPEATED)
        for (var T = 0; T < m.length; T++) {
          e.writeVarInt(S), f[y](e, m[T], E);
        }
      else {
        e.writeVarInt(S), f[y](e, m, E);
      }
    }
  }
}

export const encodeProto = function (e, t, r = new Binary()) {
  /*return (0,
    o.checkValid)(e, t),
    _(r, t, e),
    d = void 0,
    r*/

  _(r, t, e);

  return r;
};
