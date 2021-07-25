(e,t,r)=>{
    "use strict";
    var a = r(95318);
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.createWid = o,
    t.createWidFromWidLike = function(e) {
        return o("string" == typeof e ? e : e._serialized)
    }
    ,
    t.isWidlike = function(e) {
        return !!e && (!!n.default.isWid(e) || !(!e || "object" != typeof e || !n.default.isWid(e._serialized)))
    }
    ,
    t.createDeviceWidFromUserAndDevice = function(e, t) {
        return l(`${e}:${t}@c.us`)
    }
    ,
    t.createDeviceWid = l,
    t.createUserWid = d,
    t.toUserWid = u,
    t.toChatWid = function(e) {
        if (e.isUser())
            return u(e);
        return e
    }
    ,
    t.userJidToUserWid = function(e) {
        return u(o(e))
    }
    ;
    var i = r(16241)
      , n = a(r(43501))
      , s = a(r(25932));
    function o(e) {
        var t;
        return s.default && s.default.cache ? (t = s.default.cache[e]) || (t = new n.default(e,{
            intentionallyUsePrivateConstructor: !0
        }),
        s.default.cache[e] = t) : t = new n.default(e,{
            intentionallyUsePrivateConstructor: !0
        }),
        t
    }
    function l(e) {
        return o(e)
    }
    function d(e, t) {
        var r;
        if (!(null != (r = o(r = (0,
        i.isString)(e) && (e.endsWith("@c.us") || e.endsWith("@s.whatsapp.net")) ? e : `${e}@${t || "c.us"}`)).device && 0 !== r.device || null != r.agent && 0 !== r.agent))
            return r;
        throw new Error("createUserWid is called with invalid user string")
    }
    function u(e) {
        if (!e.isUser())
            throw new Error("asUserWid: wid is not a user wid");
        return null != e.device && 0 !== e.device || null != e.agent && 0 !== e.agent ? d(e.user) : e
    }
}