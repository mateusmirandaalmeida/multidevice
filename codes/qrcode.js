getData() {
    if (f.default.connected)
        return Promise.resolve(void 0);
    var e = f.default.ref;
    if (v.default.supportsFeature(v.default.F.MD_BACKEND))
        return G.waSignalStore.getRegistrationInfo().then(function() {
            var t = (0,
            n.default)((function*(t) {
                var r = yield k.waNoiseInfo.get();
                if (!r || !r.staticKeyPair || !t)
                    return __LOG__(4, void 0, new Error, !0)`Assertion failed!`,
                    SEND_LOGS("Empty noiseInfo or empty regInfo"),
                    null;
                var a = (0,
                U.encodeB64)(r.staticKeyPair.pubKey)
                  , i = (0,
                U.encodeB64)(t.identityKeyPair.pubKey)
                  , n = (0,
                F.getADVSecretKey)();
                return e + "," + a + "," + i + "," + n
            }
            ));
            return function() {
                return t.apply(this, arguments)
            }
        }());
    var t = u.default.id();
    return Promise.resolve().then((()=>{
        var r = P.getOrGenerate();
        return e + "," + r + "," + t
    }
    ))
}