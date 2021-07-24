(e,t,r)=>{
    "use strict";
    var a = r(20862)
      , i = r(95318);
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.default = function(e) {
        var t = g.parse(e);
        if (t.error)
            return __LOG__(2)`error while parsing: ${e.toString()}`,
            __LOG__(4, void 0, new Error)`Parsing Error: ${t.error.toString()}`,
            Promise.reject(t.error);
        var r = t.success;
        if (r && r.refs && Array.isArray(r.refs) && 6 === r.refs.length) {
            var {refs: a, id: i} = r;
            (0,
            l.castStanza)((0,
            n.wap)("iq", {
                to: n.S_WHATSAPP_NET,
                type: "result",
                id: (0,
                n.CUSTOM_STRING)(i)
            })),
            (0,
            o.generateADVSecretKey)(),
            _ = a,
            m || (m = new s.ShiftTimer((()=>{
                if (!(0,
                c.isRegistered)() && p.default.online && u.default.supportsFeature(u.default.F.MD_BACKEND))
                    if (_ && _.length) {
                        var e = 6 === _.length ? 6e4 : 2e4
                          , t = _.shift();
                        d.default.set({
                            ref: t,
                            refTTL: e
                        }),
                        h.default.state = h.STATE.UNPAIRED,
                        m && m.onOrAfter(e)
                    } else
                        m && m.cancel(),
                        m = null,
                        h.default.state = h.STATE.UNPAIRED_IDLE;
                else
                    m && m.cancel(),
                    m = null
            }
            ))),
            m.forceRunNow()
        } else
            __LOG__(3)`handlePairDevice: wrong pair device result received from server`
    }
    ;
    var n = r(24488)
      , s = r(20014)
      , o = r(43015)
      , l = r(10378)
      , d = i(r(3243))
      , u = i(r(60246))
      , c = r(97729)
      , p = i(r(96361))
      , f = i(r(79112))
      , h = a(r(11774))
      , _ = []
      , m = null
      , g = new f.default("pairDeviceParser",(e=>{
        e.assertTag("iq"),
        e.assertFromServer();
        var t = [];
        return e.child("pair-device").forEachChild((e=>{
            e.assertTag("ref"),
            t.push(e.contentString())
        }
        )),
        {
            refs: t,
            id: e.attrString("id")
        }
    }
    ))
}