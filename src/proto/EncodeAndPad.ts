import { Binary } from './Binary';
import { SPEC_CONSTS } from './Spec';
import { MessageSpec } from './specs/Message';
import * as Crypto from 'crypto';

const crypto = Crypto.webcrypto as any;

class i {
    private names;
    private fields;
    private types;
    private defaults;
    private meta;
    private oneofToFields;
    private fieldToOneof;
    private reservedTags;
    private reservedFields;
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

function compileSpec(e) {
    function n(e, t) {
        var r = e[t];
        if (null == r) throw new Error(`fieldData of ${t} is missing`);
        return r;
    }

    if (e.internalCompiledSpec) return e.internalCompiledSpec;
    var t = e.internalSpec;
    if (!t) throw new Error(`Message Class ${String(e)} does not have internalSpec`);
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
        if ((l.push(m), d.push(_), (_ & SPEC_CONSTS.TYPE_MASK) === SPEC_CONSTS.TYPES.MESSAGE)) o[p] = h[2];
        else if ((_ & SPEC_CONSTS.TYPE_MASK) === SPEC_CONSTS.TYPES.ENUM) {
            var g: any = h[2];
            if ('function' == typeof g.cast) o[p] = g;
            else {
                var v: any = !0;
                var y: any = 0;
                for (var E in g) {
                    var x: any = E;
                    v && x !== y++ && (v = !1);
                }
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
    var O = t[SPEC_CONSTS.KEYS.RESERVED] && t[SPEC_CONSTS.KEYS.RESERVED][SPEC_CONSTS.KEYS.RESERVED_TAGS],
        M = t[SPEC_CONSTS.KEYS.RESERVED] && t[SPEC_CONSTS.KEYS.RESERVED][SPEC_CONSTS.KEYS.RESERVED_FIELDS],
        w = new i(s, l, d, u, o, c, b, O, M);
    return (e.internalCompiledSpec = w), w;
}

function s(e, t) {
    var r = o(e, t);
    if (r) throw (r.reverse(), new TypeError(`Message missing required value `));
}

function o(e, t) {
    for (var { names: r, types: n, meta: s } = compileSpec(e), l = void 0, d = 0; d < n.length && !l; d++) {
        var u = n[d],
            c = r[d],
            p = Object.prototype.hasOwnProperty.call(t, c) ? t[c] : void 0;
        if (u & SPEC_CONSTS.FLAGS.REQUIRED && void 0 === p) l = [c];
        else if ((u & SPEC_CONSTS.TYPE_MASK) === SPEC_CONSTS.TYPES.MESSAGE && u & SPEC_CONSTS.FLAGS.REPEATED && void 0 !== p) {
            var f = s[d],
                h = void 0;
            for (h = 0; h < p.length && !l; h++) l = o(f, p[h]);
            l && l.push(`${c}[${h}]`);
        } else (u & SPEC_CONSTS.TYPE_MASK) === SPEC_CONSTS.TYPES.MESSAGE && void 0 !== p && (l = o(s[d], p)) && l.push(c);
    }
    return l;
}

function l(e, t, r) {
    return 'string' == typeof e
        ? !/^-?0x[0-9a-f]{16}$/i.test(e) && {
              path: [],
              error: "value must be a hex string of the form '0x123...' or '-0x123...' where the tail is always 16 characters long",
          }
        : d(e, t, r);
}
function d(e, t, r) {
    return 'number' != typeof e || e != e || Math.floor(e) !== e
        ? {
              path: [],
              error: 'value must be an int',
          }
        : (e < t || e >= r) && {
              path: [],
              error: 'value is out of range',
          };
}
function u(e, t, r) {
    return e
        ? void 0
        : {
              path: [],
              error: 'value is invalid',
          };
}
function c(e) {
    return 'string' == typeof e ? `"${e}"` : Array.isArray(e) ? `[${e.join(', ')}]` : `${e}`;
}

var n = Number.MAX_SAFE_INTEGER;
var p = [
    void 0,
    (e) => d(e, -2147483648, 2147483648),
    (e) => l(e, -n, n + 1),
    (e) => d(e, 0, 4294967296),
    (e) => l(e, 0, n + 1),
    (e) => d(e, -2147483648, 2147483648),
    (e) => l(e, -n, n + 1),
    (e) => u('boolean' == typeof e, 'boolean', e),
    (e, t) => u('number' == typeof e && (t[e] || void 0 !== t.cast(e)), 'in enum', e),
    (e) => l(e, 0, n + 1),
    (e) => l(e, -n, n + 1),
    (e) => u('number' == typeof e, 'number', e),
    (e) => u('string' == typeof e, 'string', e),
    (e) => u(e instanceof ArrayBuffer || e instanceof Uint8Array, 'ArrayBuffer or Uint8Array', e),
    f,
    (e) => d(e, 0, 4294967296),
    (e) => d(e, -2147483648, 2147483648),
    (e) => u('number' == typeof e, 'number', e),
];

function f(e, t) {
    for (
        var { names: r, fields: n, types: s, meta: o, oneofToFields: l, fieldToOneof: d, reservedTags: u, reservedFields: f } = compileSpec(t),
            h = void 0,
            _ = function (t) {
                var a = r[t],
                    _ = s[t],
                    m = e[a],
                    g = _ & SPEC_CONSTS.TYPE_MASK,
                    v = p[g];
                if (void 0 === v) throw new Error(`Can not find the validator for type ${g}`);
                if (_ & (SPEC_CONSTS.FLAGS.PACKED | SPEC_CONSTS.FLAGS.REPEATED) && void 0 !== m)
                    if (Array.isArray(m)) for (var y = o[t], E = 0; E < m.length && !h; E++) (h = v(m[E], y)) && h.path.push(`${a}[${E}]`);
                    else
                        h = {
                            path: [a],
                            error: 'repeated field must be array',
                        };
                else if (void 0 !== m) {
                    (h = v(m, o[t])) && h.path.push(a);
                    var S = d[a];
                    S &&
                        S.forEach((t) => {
                            l[t]
                                .filter((e) => e !== a)
                                .forEach((r) => {
                                    void 0 !== e[r] &&
                                        (h = {
                                            path: [t],
                                            error: `oneof has fields '${a}' and '${r}' set`,
                                        });
                                });
                        }),
                        u[n[t]] &&
                            (h = {
                                path: [a],
                                error: `tag ${n[t]} is reserved`,
                            }),
                        f[a] &&
                            (h = {
                                path: [a],
                                error: 'field name is reserved',
                            });
                }
            },
            m = 0;
        m < r.length && !h;
        m++
    )
        _(m);
    return h;
}

function checkValid(e, t) {
    s(e, t);
    var r = f(t, e);
    if (r) throw (r.path.reverse(), new TypeError(''));
}

const typeToEncType = function (e) {
    const { FLAGS: n, TYPES: s, TYPE_MASK: o, ENC: l } = SPEC_CONSTS;
    if (e & n.PACKED) return l.BINARY;
    var t = e & o;
    return t <= s.ENUM ? l.VARINT : t <= s.DOUBLE ? l.BIT64 : t <= s.MESSAGE ? l.BINARY : l.BIT32;
};

function numUtf8Bytes(e) {
    var l = '',
        d = 0;
    if (e === l) return d;
    for (var t = e.length, r = 0, a = 0; a < t; a++) {
        var i = e.charCodeAt(a);
        if (i < 128) r++;
        else if (i < 2048) r += 2;
        else if (i < 55296 || (57344 <= i && i <= 65535)) r += 3;
        else if (55296 <= i && i < 56320 && a + 1 !== t) {
            var n = e.charCodeAt(a + 1);
            56320 <= n && n < 57344 ? (a++, (r += 4)) : (r += 3);
        } else r += 3;
    }
    return (l = e), (d = r);
}

function _(e, t, r) {
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
                'number' == typeof t ? e.writeUint64(t, !0) : e.writeHexLong(t, !0);
            },
            (e, t) => {
                'number' == typeof t ? e.writeInt64(t, !0) : e.writeHexLong(t, !0);
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
            function (e, t, r) {
                function _(e, t, r) {
                    for (var {names: a, fields: o, types: l, meta: u} = compileSpec(r), {internalDefaults: c} = r, p = 0; p < a.length; p++) {
                        var _ = a[p]
                          , m = t[_];
                        if (void 0 === m && c && (m = c[_]),
                        void 0 !== m) {
                            var g = o[p]
                              , v = l[p]
                              , y = v & SPEC_CONSTS.TYPE_MASK
                              , E = u[p]
                              , S = 8 * g | typeToEncType(v);
                            if (v & SPEC_CONSTS.FLAGS.PACKED) {
                                if (m.length > 0)
                                    e.writeVarInt(S),
                                    h[y](e, m)
                            } else if (v & SPEC_CONSTS.FLAGS.REPEATED)
                                for (var T = 0; T < m.length; T++) {
                                    e.writeVarInt(S),
                                    f[y](e, m[T], E)
                                }
                            else {
                                e.writeVarInt(S),
                                f[y](e, m, E)
                            }
                        }
                    }
                }

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

    for (var { names: a, fields: o, types: l, meta: u } = compileSpec(r), { internalDefaults: c } = r, p = 0; p < a.length; p++) {
        var _ = a[p],
            m = t[_];
        if ((void 0 === m && c && (m = c[_]), void 0 !== m)) {
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

const encodeProto = (e, t, r = new Binary()) => {
    checkValid(e, t);
    _(r, t, e);
    return r;
};

export const encodeAndPad = (e) => {
    var t = encodeProto(MessageSpec, e);
    return writeRandomPadMax16(t), t.readByteArray();
};

const writeRandomPadMax16 = function (e) {
    function r(e, t) {
        for (var r = 0; r < t; r++) e.writeUint8(t);
    }
    var t = new Uint8Array(1);
    crypto.getRandomValues(t), r(e, 1 + (15 & t[0]));
};
