export const SPEC_CONSTS = {
  FLAGS: {
    REPEATED: 64,
    PACKED: 128,
    REQUIRED: 256,
  },
  TYPE_MASK: 31,
  TYPES: {
    INT32: 1,
    INT64: 2,
    UINT32: 3,
    UINT64: 4,
    SINT32: 5,
    SINT64: 6,
    BOOL: 7,
    ENUM: 8,
    FIXED64: 9,
    SFIXED64: 10,
    DOUBLE: 11,
    STRING: 12,
    BYTES: 13,
    MESSAGE: 14,
    FIXED32: 15,
    SFIXED32: 16,
    FLOAT: 17,
  },
  ENC: {
    VARINT: 0,
    BIT64: 1,
    BINARY: 2,
    BIT32: 5,
  },
  KEYS: {
    ONEOF: "__oneofs__",
    RESERVED: "__reserved__",
    RESERVED_TAGS: "tags",
    RESERVED_FIELDS: "fields",
  },
};

function n(e, t) {
  var r = e[t];
  if (null == r) throw new Error(`fieldData of ${t} is missing`);
  return r;
}

export const compileSpec = function (e) {
  if (e.internalCompiledSpec) return e.internalCompiledSpec;
  var t = e.internalSpec;
  if (!t)
    throw new Error(`Message Class ${JSON.stringify(e)} does not have internalSpec`);
  var r = e.internalDefaults || {},
    s = Object.keys(t).filter((e) => e !== SPEC_CONSTS.KEYS.ONEOF),
    o = new Array(s.length),
    l = [],
    d = [],
    u = new Array(s.length),
    c = t[SPEC_CONSTS.KEYS.ONEOF] || {};
  s.sort((e, r) => {
    var a = n(t, e),
      i = n(t, r);
    return a[0] - i[0];
  });
  for (var p = 0; p < s.length; p++) {
    var f = s[p],
      h = n(t, f);
    u[p] = r[f];
    var _ = h[1],
      m = h[0];
    if (
      (l.push(m),
      d.push(_),
      (_ & SPEC_CONSTS.TYPE_MASK) === SPEC_CONSTS.TYPES.MESSAGE)
    )
      o[p] = h[2];
    else if ((_ & SPEC_CONSTS.TYPE_MASK) === SPEC_CONSTS.TYPES.ENUM) {
      var g = h[2];
      if ("function" == typeof g.cast) o[p] = g;
      else {
        var v = !0,
          y = 0;
        //for (var E in g) v && E !== y++ && (v = !1);
        for (var E in g) v && (v = !1);
        var S = void 0;
        if (v) {
          S = [];
          for (var T = 0; T < y; T++) S.push(!0);
        } else for (var A in ((S = {}), g)) S[g[A]] = !0;
        o[p] = S;
      }
    } else o[p] = null;
  }
  var b = {},
    C = function (e) {
      c[e].forEach((t) => {
        b[t] || (b[t] = []), b[t].push(e);
      });
    };
  for (var P in c) C(P);
  var O =
      t[SPEC_CONSTS.KEYS.RESERVED] &&
      t[SPEC_CONSTS.KEYS.RESERVED][SPEC_CONSTS.KEYS.RESERVED_TAGS],
    M =
      t[SPEC_CONSTS.KEYS.RESERVED] &&
      t[SPEC_CONSTS.KEYS.RESERVED][SPEC_CONSTS.KEYS.RESERVED_FIELDS],
    w = new Spec(s, l, d, u, o, c, b, O, M);
  return (e.internalCompiledSpec = w), w;
};

export class Spec {
  public names: any;
  public fields: any;
  public types: any;
  public defaults: any;
  public meta: any;
  public oneofToFields: any;
  public fieldToOneof: any;
  public reservedTags: any;
  public reservedFields: any;

  constructor(e, t, r, a, i, n, s, o, l) {
    (this.names = e),
      (this.fields = t),
      (this.types = r),
      (this.defaults = a),
      (this.meta = i),
      (this.oneofToFields = n),
      (this.fieldToOneof = s),
      (this.reservedTags = o ? o.reduce((e, t) => ((e[t] = !0), e), {}) : {}),
      (this.reservedFields = l ? l.reduce((e, t) => ((e[t] = !0), e), {}) : {});
  }
}
