import { Binary, longFitsInDouble, parseInt64OrThrow, parseUint64OrThrow } from "./Binary";
import { createHexLongFrom32Bits } from "./../utils/HexHelper";
import { compileSpec, SPEC_CONSTS } from './Spec';
import { typeToEncType } from './EncodeProto';

/*var i = a(r(73982)); // getOwnPropertyDescriptor,
(n = r(81291)) // binary,
  (s = r(5781)) // spec,
  (o = r(17126)) // spec consts,
  (l = r(80736)) // typeToEncType,
  (d = r(86043)) // validator,
  (u = r(91579)) // hex helper;
*/

const defineObj = function (e, t, n) {
  return (
    t in e
      ? Object.defineProperty(e, t, {
          value: n,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (e[t] = n),
    e
  );
};

function iii(e, t = undefined) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t &&
      (r = r.filter(function (t) {
        return Object.getOwnPropertyDescriptor(e, t).enumerable;
      })),
      n.push.apply(n, r);
  }
  return n;
}

export const getOwnPropertyDescriptor = function (e, aaa) {
  for (var t = 1; t < arguments.length; t++) {
    var n = null != arguments[t] ? arguments[t] : {};
    t % 2
      ? iii(Object(n), !0).forEach(function (t) {
            defineObj(e, t, n[t]);
        })
      : Object.getOwnPropertyDescriptors
      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
      : iii(Object(n)).forEach(function (t) {
          Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
        });
  }
  return e;
};

function c(e, t, r) {
  if (e !== typeToEncType(t))
    throw new Error(`FormatError: ${r} encoded with wire type ${e}`);
}
function p(e, t, r) {
  switch (t) {
    case SPEC_CONSTS.TYPES.INT32:
      return f(r, -2147483648, 2147483648, e, parseInt64OrThrow);
    case SPEC_CONSTS.TYPES.INT64:
      return r.readVarInt(h);
    case SPEC_CONSTS.TYPES.UINT32:
      return f(r, 0, 4294967296, e, parseUint64OrThrow);
    case SPEC_CONSTS.TYPES.UINT64:
      return r.readVarInt(_);
    case SPEC_CONSTS.TYPES.SINT32:
      var a = f(r, 0, 4294967296, e, parseInt64OrThrow);
      return 1 & a ? ~(a >>> 1) : a >>> 1;
    case SPEC_CONSTS.TYPES.SINT64:
      return r.readVarInt(m);
    case SPEC_CONSTS.TYPES.BOOL:
      return !!f(r, 0, 2, e, parseUint64OrThrow);
    case SPEC_CONSTS.TYPES.ENUM:
      return r.readVarInt(parseInt64OrThrow);
    case SPEC_CONSTS.TYPES.FIXED64:
      return r.readLong(_, !0);
    case SPEC_CONSTS.TYPES.SFIXED64:
      return r.readLong(h, !0);
    case SPEC_CONSTS.TYPES.DOUBLE:
      return r.readFloat64(!0);
    case SPEC_CONSTS.TYPES.STRING:
      return r.readString(r.readVarInt(parseUint64OrThrow));
    case SPEC_CONSTS.TYPES.BYTES:
      return r.readBuffer(r.readVarInt(parseUint64OrThrow));
    case SPEC_CONSTS.TYPES.FIXED32:
      return r.readUint32(!0);
    case SPEC_CONSTS.TYPES.SFIXED32:
      return r.readInt32(!0);
    case SPEC_CONSTS.TYPES.FLOAT:
      return r.readFloat32(!0);
  }
}
function f(e, t, r, a, i) {
  var n = e.readVarInt(i);
  if (n < t || n >= r)
    throw new Error(`FormatError: ${a} encoded with out-of-range value ${n}`);
  return n;
}
function h(e, t) {
  if (longFitsInDouble(!0, e, t)) return 4294967296 * e + v(t);
  var r,
    a = e < 0;
  r = a ? (0 === t ? -e : ~e) : e;
  var i = a ? -t : t;
  return createHexLongFrom32Bits(r, i, a);
}
function _(e, t) {
  return longFitsInDouble(!1, e, t)
    ? 4294967296 * v(e) + v(t)
    : createHexLongFrom32Bits(e, t);
}
function m(e, t) {
  var r = e >>> 1,
    a = (e << 31) | (t >>> 1);
  return 1 & t && ((r = ~r), (a = ~a)), h(r, a);
}
function g(e, t, r, a) {
  for (
    var {
        names: l,
        fields: d,
        types: u,
        meta: h,
        oneofToFields: _,
        fieldToOneof: m,
        reservedTags: v,
        reservedFields: y,
      } = compileSpec(e),
      { internalDefaults: E } = e,
      S = r || getOwnPropertyDescriptor({}, E) || {},
      T = 0;
    T < l.length;
    T++
  )
    u[T] & SPEC_CONSTS.FLAGS.REPEATED && (S[l[T]] = []);
  for (var A = 0, b = d[0]; t.size(); ) {
    var C = f(t, 0, 4294967296, "field and enc type", parseInt64OrThrow),
      P = 7 & C,
      O = C >>> 3;
    if (O !== b) {
      var M = A;
      do {
        ++A === d.length && (A = 0), (b = d[A]);
      } while (O !== b && A !== M);
    }
    if (O === b)
      // !
      (function () {
        var e = l[A],
          r = u[A];
        c(P, r, e);
        var i = r & SPEC_CONSTS.TYPE_MASK,
          s = h[A];
        if (r & SPEC_CONSTS.FLAGS.PACKED)
          for (
            var d = t.readVarInt(parseUint64OrThrow), f = t.readBinary(d);
            f.size();

          ) {
            var E = p(e, i, f);
            (i !== SPEC_CONSTS.TYPES.ENUM || s[E] || void 0 !== s.cast(E)) &&
              S[e].push(E);
          }
        else if (i === SPEC_CONSTS.TYPES.MESSAGE) {
          var T = t.readVarInt(parseUint64OrThrow),
            b = t.readBinary(T);
          if (r & SPEC_CONSTS.FLAGS.REPEATED) S[e].push(g(s, b, void 0, a));
          else {
            var C = S[e];
            S[e] = g(s, b, C, a);
          }
        } else {
          var M = p(e, i, t);
          (i !== SPEC_CONSTS.TYPES.ENUM || s[M] || void 0 !== s.cast(M)) &&
            (r & SPEC_CONSTS.FLAGS.REPEATED ? S[e].push(M) : (S[e] = M));
        }
        var w = m[e];
        w &&
          void 0 !== S[e] &&
          w.forEach((t) => {
            _[t]
              .filter((t) => t !== e)
              .forEach((e) => {
                delete S[e];
              });
          }),
          (v[O] || y[e]) && delete S[e];
      })();
    else if (a) {
      S.unsafeUnknownFields || (S.unsafeUnknownFields = {});
      var w = void 0;
      switch (P) {
        case SPEC_CONSTS.ENC.VARINT:
          w = t.readVarInt(parseInt64OrThrow);
          break;
        case SPEC_CONSTS.ENC.BIT64:
          w = t.readBinary(8);
          break;
        case SPEC_CONSTS.ENC.BINARY:
          w = t.readBinary(t.readVarInt(parseUint64OrThrow));
          break;
        case SPEC_CONSTS.ENC.BIT32:
          w = t.readBinary(4);
      }
      S.unsafeUnknownFields[O] = w;
    } else
      P === SPEC_CONSTS.ENC.VARINT
        ? t.readVarInt(parseInt64OrThrow)
        : P === SPEC_CONSTS.ENC.BIT64
        ? t.advance(8)
        : P === SPEC_CONSTS.ENC.BINARY
        ? t.advance(t.readVarInt(parseUint64OrThrow))
        : P === SPEC_CONSTS.ENC.BIT32 && t.advance(4);
  }
  return S;
}
function v(e) {
  return e >= 0 ? e : 4294967296 + e;
}

export const decodeProto = function (e, t) {
  /*var r = new n.Binary(t)
      , a = g(e, r, void 0, !1);
    return (0,
    d.checkRequirements)(e, a),
    a*/

  const data = new Binary(t);
  return g(e, data, void 0, false);
};

export const decodeProtoWithUnknowns = function (e, t) {
  /*var r = new n.Binary(t)
      , a = g(e, r, void 0, !0);
    return (0,
    d.checkRequirements)(e, a),
    a*/

  const data = new Binary(t);
  return g(e, data, void 0, true);
};

export const getUnknownFields = function (e) {
  return Object.prototype.hasOwnProperty.call(e, "unsafeUnknownFields")
    ? e.unsafeUnknownFields
    : null;
};
