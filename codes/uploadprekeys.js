(e,t,r)=>{
    "use strict";
    var a = r(95318);
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.uploadPreKeys = function() {
        var e = new n.PromiseRetryLoop({
            name: "uploadPreKeys",
            timer: h,
            code: e=>(__LOG__(2)`uploadPreKeys: running`,
            Promise.all([u.waSignalStore.getRegistrationInfo(), u.waSignalStore.getSignedPreKey()]).then((([e,t])=>{
                if (!e || !t)
                    throw new Error("No signal info is available");
                var {registrationId: r, identityKeyPair: a} = e;
                return u.waSignalStore.getOrGenPreKeys(30, l.generatePreKeyPair).then((e=>{
                    if (0 === e.length)
                        throw new Error("No preKey is available");
                    return [(0,
                    i.wap)("iq", {
                        id: (0,
                        i.generateId)(),
                        xmlns: "encrypt",
                        type: "set",
                        to: i.S_WHATSAPP_NET
                    }, (0,
                    i.wap)("registration", null, (0,
                    i.BIG_ENDIAN_CONTENT)(r)), (0,
                    i.wap)("type", null, o.default.KEY_BUNDLE_TYPE), (0,
                    i.wap)("identity", null, a.pubKey), (0,
                    i.wap)("list", null, e.map(c.xmppPreKey)), (0,
                    c.xmppSignedPreKey)(t)), e[e.length - 1].keyId]
                }
                )).then((([e,t])=>(0,
                s.waitForConnection)().then((()=>u.waSignalStore.markKeyAsUploaded(t))).then((()=>(0,
                s.sendIqWithoutRetry)(e, f))).then((e=>{
                    if (e.success)
                        return u.waSignalStore.setServerHasPreKeys(!0),
                        {
                            success: !0
                        };
                    var t = e.errorCode;
                    return t >= 500 ? __LOG__(3)`_uploadPreKeys: server requested backoff ${t}` : 406 === t ? __LOG__(3)`_uploadPreKeys: uploaded invalid keys` : __LOG__(3)`_uploadPreKeys: unrecognized error ${t}`,
                    {
                        errorCode: e.errorCode,
                        errorText: e.errorText
                    }
                }
                )).catch((()=>{
                    __LOG__(3)`_uploadPreKeys: disconnected, unclear if on server`
                }
                ))))
            }
            )).then((t=>{
                t && t.success ? e() : __LOG__(2)`uploadPreKeys: retrying (after delay)`
            }
            )))
        });
        return e.start(),
        e.promise()
    }
    ;
    var i = r(24488)
      , n = r(5749)
      , s = r(10378)
      , o = a(r(46274))
      , l = r(31359)
      , d = a(r(79112))
      , u = r(44221)
      , c = r(90603)
      , p = {
        error: !1,
        result: !0
    }
      , f = new d.default("uploadPreKeyResParser",(e=>{
        if (e.assertTag("iq"),
        e.assertFromServer(),
        e.attrEnum("type", p))
            return {
                success: !0
            };
        var t = e.child("error");
        return {
            errorCode: t.attrInt("code"),
            errorText: t.hasAttr("text") ? t.attrString("text") : ""
        }
    }
    ));
    var h = {
        algo: {
            type: "fibonacci",
            first: 1e3,
            second: 2e3
        },
        max: 61e4
    }
}