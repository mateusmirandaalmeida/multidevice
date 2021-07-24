(e,t,r)=>{
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.checkRequirements = s,
    t.checkValid = function(e, t) {
        s(e, t);
        var r = f(t, e);
        if (r)
            throw r.path.reverse(),
            new TypeError(`Invalid value at ${r.path.join(".")}: ${r.error}`)
    }
    ;
    var a = r(5781)
      , i = r(17126)
      , n = Number.MAX_SAFE_INTEGER;
    function s(e, t) {
        var r = o(e, t);
        if (r)
            throw r.reverse(),
            new TypeError(`Message missing required value ${r.join(".")}`)
    }
    function o(e, t) {
        for (var {names: r, types: n, meta: s} = (0,
        a.compileSpec)(e), l = void 0, d = 0; d < n.length && !l; d++) {
            var u = n[d]
              , c = r[d]
              , p = Object.prototype.hasOwnProperty.call(t, c) ? t[c] : void 0;
            if (u & i.FLAGS.REQUIRED && void 0 === p)
                l = [c];
            else if ((u & i.TYPE_MASK) === i.TYPES.MESSAGE && u & i.FLAGS.REPEATED && void 0 !== p) {
                var f = s[d]
                  , h = void 0;
                for (h = 0; h < p.length && !l; h++)
                    l = o(f, p[h]);
                l && l.push(`${c}[${h}]`)
            } else
                (u & i.TYPE_MASK) === i.TYPES.MESSAGE && void 0 !== p && (l = o(s[d], p)) && l.push(c)
        }
        return l
    }
    function l(e, t, r) {
        return "string" == typeof e ? !/^-?0x[0-9a-f]{16}$/i.test(e) && (__LOG__(2)`"${c(e)}" is not a valid long`,
        {
            path: [],
            error: "value must be a hex string of the form '0x123...' or '-0x123...' where the tail is always 16 characters long"
        }) : d(e, t, r)
    }
    function d(e, t, r) {
        return "number" != typeof e || e != e || Math.floor(e) !== e ? (__LOG__(2)`"${c(e)}" is not a valid int`,
        {
            path: [],
            error: "value must be an int"
        }) : (e < t || e >= r) && (__LOG__(2)`"${c(e)}" is out of range`,
        {
            path: [],
            error: "value is out of range"
        })
    }
    function u(e, t, r) {
        return e ? void 0 : (__LOG__(2)`"${c(r)}" is not ${t}`,
        {
            path: [],
            error: "value is invalid"
        })
    }
    function c(e) {
        return "string" == typeof e ? `"${e}"` : Array.isArray(e) ? `[${e.join(", ")}]` : `${e}`
    }
    var p = [void 0, e=>d(e, -2147483648, 2147483648), e=>l(e, -n, n + 1), e=>d(e, 0, 4294967296), e=>l(e, 0, n + 1), e=>d(e, -2147483648, 2147483648), e=>l(e, -n, n + 1), e=>u("boolean" == typeof e, "boolean", e), (e,t)=>u("number" == typeof e && (t[e] || void 0 !== t.cast(e)), "in enum", e), e=>l(e, 0, n + 1), e=>l(e, -n, n + 1), e=>u("number" == typeof e, "number", e), e=>u("string" == typeof e, "string", e), e=>u(e instanceof ArrayBuffer || e instanceof Uint8Array, "ArrayBuffer or Uint8Array", e), f, e=>d(e, 0, 4294967296), e=>d(e, -2147483648, 2147483648), e=>u("number" == typeof e, "number", e)];
    function f(e, t) {
        for (var {names: r, fields: n, types: s, meta: o, oneofToFields: l, fieldToOneof: d, reservedTags: u, reservedFields: f} = (0,
        a.compileSpec)(t), h = void 0, _ = function(t) {
            var a = r[t]
              , _ = s[t]
              , m = e[a]
              , g = _ & i.TYPE_MASK
              , v = p[g];
            if (void 0 === v)
                throw new Error(`Can not find the validator for type ${g}`);
            if (_ & (i.FLAGS.PACKED | i.FLAGS.REPEATED) && void 0 !== m)
                if (Array.isArray(m))
                    for (var y = o[t], E = 0; E < m.length && !h; E++)
                        (h = v(m[E], y)) && h.path.push(`${a}[${E}]`);
                else
                    __LOG__(2)`"${c(m)}" is not an array`,
                    h = {
                        path: [a],
                        error: "repeated field must be array"
                    };
            else if (void 0 !== m) {
                (h = v(m, o[t])) && h.path.push(a);
                var S = d[a];
                S && S.forEach((t=>{
                    l[t].filter((e=>e !== a)).forEach((r=>{
                        void 0 !== e[r] && (h = {
                            path: [t],
                            error: `oneof has fields '${a}' and '${r}' set`
                        })
                    }
                    ))
                }
                )),
                u[n[t]] && (h = {
                    path: [a],
                    error: `tag ${n[t]} is reserved`
                }),
                f[a] && (h = {
                    path: [a],
                    error: "field name is reserved"
                })
            }
        }, m = 0; m < r.length && !h; m++)
            _(m);
        return h
    }
}