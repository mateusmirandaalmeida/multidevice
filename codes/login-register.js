(e,t,r)=>{
    "use strict";
    var a = r(95318);
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.getClientPayloadForLogin = function(e) {
        var t = (0,
        c.assertGetMe)()
          , r = (0,
        i.default)((0,
        i.default)({}, _(e)), {}, {
            username: parseInt(t.user, 10),
            device: null != t.device ? t.device : 0
        });
        return (0,
        n.encodeProto)(h.ClientPayloadSpec, r).readByteArray()
    }
    ,
    t.getClientPayloadForRegistration = function(e, t, r) {
        var a = m()
          , s = g()
          , o = (0,
        i.default)((0,
        i.default)({}, _(r)), {}, {
            regData: {
                buildHash: a,
                companionProps: s,
                eRegid: (0,
                l.intToBytes)(4, e.registrationId),
                eKeytype: (0,
                l.intToBytes)(1, 5),
                eIdent: e.identityKeyPair.pubKey,
                eSkeyId: (0,
                l.intToBytes)(3, t.keyId),
                eSkeyVal: t.keyPair.pubKey,
                eSkeySig: t.signature
            }
        });
        return (0,
        n.encodeProto)(h.ClientPayloadSpec, o).readByteArray()
    }
    ,
    t.getBuildHash = m,
    t.getCompanionProps = g,
    t.getUserAgent = v,
    t.getPlatformTypeFromName = y,
    t.getWebSubPlatform = E;
    var i = a(r(81109))
      , n = r(94077)
      , s = r(90820)
      , o = a(r(90075))
      , l = r(10321)
      , d = r(86917)
      , u = a(r(46274))
      , c = r(56726)
      , p = r(561)
      , f = a(r(25802))
      , h = r(90621);
    function _(e) {
        return {
            passive: !!e && e.passive,
            connectType: h.ClientPayloadConnectType.WIFI_UNKNOWN,
            connectReason: h.ClientPayloadConnectReason.USER_ACTIVATED,
            userAgent: v(),
            webInfo: {
                webSubPlatform: E()
            }
        }
    }
    function m() {
        var e = (0,
        s.decodeB64)((0,
        f.default)(u.default.VERSION_BASE));
        return new Uint8Array(e)
    }
    function g() {
        var e, t = o.default.info();
        if (t.version && "" !== t.version) {
            var r = t.version.split(".");
            r.length > 0 && t.version && /^[0-9\.]+$/.test(t.version) && (e = {
                primary: parseInt(r[0], 10),
                secondary: r.length > 1 ? parseInt(r[1], 10) : void 0,
                tertiary: r.length > 2 ? parseInt(r[2], 10) : void 0
            })
        }
        var a = {
            os: t.os,
            version: e,
            platformType: y(t.name),
            requireFullSync: !1
        };
        return (0,
        n.encodeProto)(d.CompanionPropsSpec, a).readByteArray()
    }
    function v() {
        var e = p.deviceInfo.get()
          , t = h.UserAgentReleaseChannel.RELEASE;
        return {
            appVersion: {
                primary: u.default.VERSION.p,
                secondary: u.default.VERSION.s,
                tertiary: u.default.VERSION.t
            },
            platform: h.UserAgentPlatform.WEB,
            releaseChannel: t,
            mcc: e.mcc,
            mnc: e.mnc,
            osVersion: e.osVersion,
            manufacturer: e.manufacturer,
            device: e.device,
            osBuildNumber: e.osBuild,
            localeLanguageIso6391: e.lg,
            localeCountryIso31661Alpha2: e.lc
        }
    }
    function y(e) {
        switch (e) {
        case "Chrome":
            return d.CompanionPropsPlatformType.CHROME;
        case "Firefox":
            return d.CompanionPropsPlatformType.FIREFOX;
        case "IE":
            return d.CompanionPropsPlatformType.IE;
        case "Opera":
            return d.CompanionPropsPlatformType.OPERA;
        case "Safari":
            return d.CompanionPropsPlatformType.SAFARI;
        case "Edge":
            return d.CompanionPropsPlatformType.EDGE;
        case "electron":
        case "Desktop":
            return d.CompanionPropsPlatformType.DESKTOP;
        case "ipad":
        case "iPad":
            return d.CompanionPropsPlatformType.IPAD;
        case "tablet":
        case "Android tablet":
            return d.CompanionPropsPlatformType.ANDROID_TABLET;
        case "Ohana":
            return d.CompanionPropsPlatformType.OHANA;
        case "Aloha":
            return d.CompanionPropsPlatformType.ALOHA;
        case "Catalina":
            return d.CompanionPropsPlatformType.CATALINA;
        default:
            return d.CompanionPropsPlatformType.UNKNOWN
        }
    }
    function E() {
        switch (u.default.WAM_PLATFORM) {
        case "WEB":
            return h.WebInfoWebSubPlatform.WEB_BROWSER;
        case "DARWIN":
        case "DARWIN_BETA":
            return h.WebInfoWebSubPlatform.DARWIN;
        case "WIN32":
        case "WIN32_BETA":
            return h.WebInfoWebSubPlatform.WIN32;
        case "MACSTORE":
            return h.WebInfoWebSubPlatform.APP_STORE;
        case "WINSTORE":
            return h.WebInfoWebSubPlatform.WIN_STORE;
        default:
            return
        }
    }
}