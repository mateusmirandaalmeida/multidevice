;(e, t, r) => {
    'use strict'
    var a = r(20862),
        i = r(95318)
    Object.defineProperty(t, '__esModule', {
        value: !0,
    }),
        (t.default = function () {
            return I.apply(this, arguments)
        })
    var n = i(r(48926)),
        s = r(24488),
        o = r(54972),
        l = r(94077),
        d = r(90820),
        u = r(61658),
        c = i(r(41143)),
        p = r(11548),
        f = r(43015),
        h = r(10378),
        _ = r(2346),
        m = i(r(3243)),
        g = r(3909),
        v = a(r(84032)),
        y = r(56726),
        E = i(r(53793)),
        S = i(r(5148)),
        T = r(97729),
        A = i(r(79112)),
        b = r(44221),
        C = r(36799),
        P = r(32991),
        O = i(r(11774)),
        M = !1,
        w = new A.default('pairSuccessParser', (e) => {
            var t
            e.assertTag('iq'), e.assertFromServer()
            var r = e.attrString('id'),
                a = e.child('pair-success'),
                i = null === (t = a.maybeChild('platform')) || void 0 === t ? void 0 : t.maybeAttrString('name'),
                n = a.child('device'),
                s = a.child('device-identity').contentBytes(),
                o = a.maybeChild('biz'),
                l = o ? o.attrString('name') : ''
            return {
                wid: n.attrDeviceWid('jid'),
                id: r,
                deviceIdentityBytes: s,
                businessName: l,
                platform: i,
            }
        })
    function I() {
        return (I = (0, n.default)(function* (e) {
            if (!M && !(0, T.isRegistered)()) {
                M = !0
                var t = (0, u.unixTime)(),
                    r = w.parse(e)
                if (r.error) return __LOG__(2)`error while parsing: ${e.toString()}`, __LOG__(4, void 0, new Error())`Parsing Error: ${r.error.toString()}`, (M = !1), Promise.reject(r.error)
                try {
                    ;(0, _.resetCompanionReg)(), (0, y.setHistorySyncEarliestDate)(t)
                    var a = r.success,
                        { id: i, wid: n, deviceIdentityBytes: A, platform: I } = a
                    ;(m.default.blockStoreAdds = !1), I && (m.default.platform = I)
                    var R = (0, o.decodeProto)(p.ADVSignedDeviceIdentityHMACSpec, A),
                        D = R.details,
                        N = R.hmac
                    ;(0, c.default)(null != D && null != N, 'ADVSignedDeviceIdentityHMAC should not have empty details or hmac')
                    var L = (0, f.getADVSecretKey)(),
                        k = yield new E.default(L).sign(D)
                    if ((0, d.encodeB64)(k) !== (0, d.encodeB64)(N))
                        return (
                            (0, h.castStanza)(
                                (0, s.wap)(
                                    'iq',
                                    {
                                        to: s.S_WHATSAPP_NET,
                                        type: 'error',
                                        id: (0, s.CUSTOM_STRING)(i),
                                    },
                                    (0, s.wap)('error', {
                                        code: '401',
                                        text: 'not-authorized',
                                    })
                                )
                            ),
                            (0, _.logoutAfterValidationFail)(),
                            void (M = !1)
                        )
                    var U = (0, o.decodeProto)(p.ADVSignedDeviceIdentitySpec, D),
                        G = U.accountSignatureKey
                    ;(0, c.default)(null != G, 'accountSignatreKey should not be null')
                    var F = U.accountSignature
                    ;(0, c.default)(null != F, 'accountSignature should not be null')
                    var x = yield b.waSignalStore.getRegistrationInfo()
                    if (((0, c.default)(null != x, 'Empty regInfo'), v.initDeviceLinkEvent(G, x.identityKeyPair.pubKey, t), v.setDeviceLinkPairStage(S.default.MD_LINK_DEVICE_COMPANION_STAGE.PAIR_SUCCESS_RECEIVED), !(0, f.verifyDeviceIdentityAccountSignature)(U, x.identityKeyPair.pubKey)))
                        return (
                            (0, h.castStanza)(
                                (0, s.wap)(
                                    'iq',
                                    {
                                        to: s.S_WHATSAPP_NET,
                                        type: 'error',
                                        id: (0, s.CUSTOM_STRING)(i),
                                    },
                                    (0, s.wap)('error', {
                                        code: '401',
                                        text: 'not-authorized',
                                    })
                                )
                            ),
                            v.commitDeviceLinkEvent(401),
                            (0, _.logoutAfterValidationFail)(),
                            void (M = !1)
                        )
                    ;(U.deviceSignature = (0, f.generateDeviceSignature)(U, x.identityKeyPair, G));

                    yield b.waSignalStore.putIdentity(C.createSignalAddress(P.toUserWid(n)).toString(), C.bufferToStr(g.toSignalCurvePubKey(G));
                    yield f.setADVSignedIdentity(U);                   
                   
                    var B = (0, o.decodeProto)(p.ADVDeviceIdentitySpec, U.details).keyIndex;
                    (0, c.default)(null != B, 'keyIndex should not be null');
                    (U.accountSignatureKey = void 0);
                    
                    var Y = (0, l.encodeProto)(p.ADVSignedDeviceIdentitySpec, U).readByteArray()
                    ;(0, h.castStanza)(
                        (0, s.wap)(
                            'iq',
                            {
                                to: s.S_WHATSAPP_NET,
                                type: 'result',
                                id: (0, s.CUSTOM_STRING)(i),
                            },
                            (0, s.wap)(
                                'pair-device-sign',
                                null,
                                (0, s.wap)(
                                    'device-identity',
                                    {
                                        'key-index': (0, s.INT)(B),
                                    },
                                    Y
                                )
                            )
                        )
                    ),
                        v.setDeviceLinkPairStage(S.default.MD_LINK_DEVICE_COMPANION_STAGE.PAIR_DEVICE_SIGN_SENT),
                        (0, y.setMdOptedIn)(!0),
                        (0, y.setMe)(n),
                        (0, T.getInitialHistorySyncComplete)() || (0, _.startInitialHistorySyncTimeout)(),
                        (M = !1)
                } catch (e) {
                    __LOG__(4, !0, new Error(), !0)`error in handlePairSuccess, ${e}`, SEND_LOGS('error in handlePairSuccess'), (0, v.commitDeviceLinkEvent)(-1), O.default.logout()
                }
            }
        })).apply(this, arguments)
    }
}
