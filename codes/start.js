(e, t, r) => {
	"use strict";
	var a = r(20862);
    var i = r(95318);
    var n;
    var s = i(r(48926));
    var o = r(52838);
    var l = r(14666);
    var d = r(946);
    var u = r(12899);
    var c = r(54972);
    var p = r(94077);
    var f = r(81291);
    var h = r(90820);
    var _ = r(91579);
    var m = i(r(96391));
    var g = r(61658);
    var v = r(91853);
    var y = i(r(97420));
    var E = a(r(3909));
    var S = r(561);
    var T = r(97729);
    var A = r(44221);
    var b = i(r(75399));
    var C = r(90621);
    var P = i(r(70135));
    var O = new Uint8Array([87, 65, 5, o.DICT_VERSION]);
    var M = "WhatsAppLongTerm1";
    var w = "142375574d0a587166aae71ebe516437c4a28b73e3695c6ce1f7f9545da8ee6b";

    Object.defineProperty(t, "__esModule", {
        value: !0
    }),

    t.default = function (e) {
        if (!(0, T.isRegistered)())
            return t = e,
                I().then((e => Promise.all([A.waSignalStore.getRegistrationInfo(), A.waSignalStore.getSignedPreKey(), e]))).then(function () {
                    var e = (0,
                        s.default)((function* ([e, r, a]) {
                        if (!r || !e)
                            throw new Error("Invalid signal credentials");
                        var i = (0,
                                v.getClientPayloadForRegistration)(e, r, t),
                            s = (0,
                                m.default)(yield S.waNoiseInfo.get(), "yield waNoiseInfo.get()").staticKeyPair;
                        return Promise.all([R(s, n, a), n.encrypt(Promise.resolve(i))])
                    }));
                    return function () {
                        return e.apply(this, arguments)
                    }
                }()).then((([e, t]) => (n.send((0,
                        p.encodeProto)(C.HandshakeMessageSpec, {
                        clientFinish: {
                            static: e,
                            payload: t
                        }
                    }).readByteArray()),
                    n.finish()))).then((e => (__LOG__(2)
                    `openChatSocketForRegistration success, resetting round`,
                    e))).catch((e => {
                    __LOG__(3)
                    `openChatSocketForRegistration error ${e}`
                }));
        var t;
        return function (e) {
            return I().then(function () {
                var t = (0,
                    s.default)((function* (t) {
                    y.default.incrementProgress();
                    var r = (0,
                            m.default)(yield S.waNoiseInfo.get(), "yield waNoiseInfo.get()").staticKeyPair,
                        a = (0,
                            v.getClientPayloadForLogin)(e);
                    return Promise.all([R(r, n, t), n.encrypt(Promise.resolve(a))])
                }));
                return function () {
                    return t.apply(this, arguments)
                }
            }()).then((([e, t]) => (y.default.incrementProgress(),
                n.send((0,
                    p.encodeProto)(C.HandshakeMessageSpec, {
                    clientFinish: {
                        static: e,
                        payload: t
                    }
                }).readByteArray()),
                n.finish()))).then((e => (y.default.incrementProgress(),
                __LOG__(2)
                `openChatSocketForLogin success, resetting round`,
                e))).catch((e => {
                __LOG__(3)
                `openChatSocketForLogin error ${e}`
            }))
        }(e)
    };
        
	function I() {
		var e = (0,
				T.getRoutingInfo)(),
			t = e ? e.edgeRouting : null,
			r = t ? (0,
				h.encodeB64UrlSafe)(t) : null,
			a = new b.default({
				routingToken: r
			}),
			i = E.keyPair();
		return (0,
			P.default)(a, "change:socket").cancellable().then((() => a.socket)).finally((() => {
			a.deactivate()
		})).then((e => {
			var r = void 0;
			if (t) {
				var a = new f.Binary;
				a.write("ED", 0, 1),
					a.writeUint8(t.byteLength >> 16),
					a.writeUint16(65535 & t.byteLength),
					a.writeBuffer(t),
					r = a.readByteArray(),
					__LOG__(2)
				`openChatSocket preIntro ${r}`
			}
			var s = r ? f.Binary.build(r, O).readByteArray() : O,
				o = new l.FrameSocket(e, s);
			(n = new d.NoiseHandshake(o)).start("Noise_XX_25519_AESGCM_SHA256\0\0\0\0", O),
				__LOG__(2)
			`openChatSocket send hello`,
			n.authenticate(i.pubKey);
			var u = {
				clientHello: {
					ephemeral: i.pubKey
				}
			};
			return n.sendAndReceive((0,
				p.encodeProto)(C.HandshakeMessageSpec, u).readByteArray())
		})).then((e => function (e, t, r) {
			__LOG__(2)
			`openChatSocket rcv hello`,
			__LOG__(2)
			`server hello content: ${(0,
                _.toLowerCaseHex)(t)}`;
			var {
				serverHello: a
			} = (0,
				c.decodeProto)(C.HandshakeMessageSpec, t);
			if (!a)
				throw new Error("ServerHello payload error");
			var {
				ephemeral: i,
				static: n,
				payload: s
			} = a;
			if (null == i || null == n || null == s)
				throw new Error("Missing server Ephemeral");
			__LOG__(2)
			`serverEphemeral: ${(0,
                _.toLowerCaseHex)(new Uint8Array(i))}`,
			__LOG__(2)
			`serverStaticCiphertext: ${(0,
                _.toLowerCaseHex)(new Uint8Array(n))}`,
			__LOG__(2)
			`certificateCiphertext: ${(0,
                _.toLowerCaseHex)(new Uint8Array(s))}`,
			e.authenticate(i),
				e.mixIntoKey(E.sharedSecret(i, r.privKey));
			var o = e.decrypt(n),
				l = o.then((e => E.sharedSecret(e, r.privKey)));
			return e.mixIntoKey(l),
				Promise.all([o, e.decrypt(s), i])
		}(n, e, i))).then((([e, t, r]) => (__LOG__(2)
			`verifying certificate`,
			function (e, t) {
				var r = (0,
					c.decodeProto)(C.NoiseCertificateSpec, e);
				if (!r)
					throw new Error("Missing server Ephemeral");
				var a = r.details,
					i = r.signature;
				if (!a)
					throw new Error("verifyCertificate cert missing details");
				if (!i)
					throw new Error("verifyCertificate cert missing signature");
				var n = (0,
					c.decodeProto)(C.DetailsSpec, a);
				if (n.issuer !== M)
					throw new Error(`verifyCertificate unrecognized issuer "${String(n.issuer)}"`);
				if (null != n.expires && (0,
						g.castLongIntToUnixTime)(n.expires) > (0,
						g.unixTime)())
					throw new Error("verifyCertificate cert has expired");
				if (!n.key)
					throw new Error("verifyCertificate cert has no key detail");
				if (!(0,
						u.areBuffersEqual)(n.key, t))
					throw new Error("verifySignature cert key does not match issuer");
				if (!E.verifySignature(new Uint8Array((0,
						_.parseHex)(w)), new Uint8Array(a), new Uint8Array(i)))
					throw new Error("verifyCertificate cert poorly signed!")
			}(t, e),
			r)))
	}

	function R(e, t, r) {
		var a = Promise.resolve(e.pubKey),
			i = t.encrypt(a);
		if (!r)
			return Promise.reject(new Error("staticAgreement called before serverKeys"));
		var n = E.sharedSecret(r, e.privKey);
		return t.mixIntoKey(n),
			i
	}
}