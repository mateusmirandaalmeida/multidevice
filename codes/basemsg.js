(e,t,r)=>{
    "use strict";
    var a = r(95318);
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.parseMessage = function() {
        return b.apply(this, arguments)
    }
    ,
    t.genPlaceholderMsg = function() {
        return L.apply(this, arguments)
    }
    ,
    t.generateBaseMsg = k,
    t.sendReceipt = function(e, t, r) {
        var {externalId: a} = e
          , {rawTs: i} = t
          , n = B(e)
          , d = e.type === S.MESSAGE_TYPE.CHAT && G(e.author) ? e.chat : null
          , u = e.type === S.MESSAGE_TYPE.CHAT ? null : e.author
          , c = e.category === o.CATEGORY_PEER;
        switch (r.result) {
        case S.E2EProcessResult.SUCCESS:
            return (0,
            v.sendDeliveryReceiptsAfterDecryption)(a, n, d, u, c);
        case S.E2EProcessResult.HSM_MISMATCH:
            return Promise.resolve();
        case S.E2EProcessResult.RETRY:
            var f = null == r.retryCount ? 1 : r.retryCount + 1;
            return (0,
            y.sendRetryReceipt)(f, n, u, d, a, i, c);
        default:
            return Promise.resolve((0,
            l.castStanza)((0,
            s.wap)("ack", {
                id: (0,
                s.CUSTOM_STRING)(a),
                class: "message",
                from: (0,
                T.DEVICE_JID)((0,
                p.assertGetMe)()),
                to: n ? (0,
                T.JID)(n) : s.DROP_ATTR,
                type: t.type,
                participant: u ? (0,
                T.USER_JID)(u) : s.DROP_ATTR
            })))
        }
    }
    ,
    t.isPeer = G,
    t.messageInfoToKey = F,
    t.getDeviceType = x,
    t.getFrom = B;
    var i = a(r(81109))
      , n = a(r(48926))
      , s = r(24488)
      , o = r(70978)
      , l = r(10378)
      , d = a(r(46274))
      , u = r(14869)
      , c = r(35295)
      , p = r(56726)
      , f = r(77339)
      , h = a(r(5148))
      , _ = r(24192)
      , m = a(r(4765))
      , g = a(r(80478))
      , v = r(41506)
      , y = r(70884)
      , E = r(72236)
      , S = r(36892)
      , T = r(78209)
      , A = r(32991);
    function b() {
        return (b = (0,
        n.default)((function*(e, t, r, a) {
            var i, n, s, o, l;
            if (null != (null === (i = r.protocolMessage) || void 0 === i ? void 0 : i.historySyncNotification))
                l = {
                    history: g.default.parseMsgProto(r, k(e), "relay", a).historySyncMetaData
                };
            else if (null != (null === (n = r.protocolMessage) || void 0 === n ? void 0 : n.initialSecurityNotificationSettingSync)) {
                var d;
                l = {
                    securityNotificationEnabled: {
                        isEnabled: null === (d = r.protocolMessage.initialSecurityNotificationSettingSync.securityNotificationEnabled) || void 0 === d || d
                    }
                }
            } else if (null != (null === (s = r.protocolMessage) || void 0 === s ? void 0 : s.appStateSyncKeyShare))
                l = {
                    appStateSyncKeyShare: r.protocolMessage.appStateSyncKeyShare
                };
            else if (null != (null === (o = r.protocolMessage) || void 0 === o ? void 0 : o.appStateSyncKeyRequest))
                l = {
                    appStateSyncKeyRequest: r.protocolMessage.appStateSyncKeyRequest
                };
            else
                switch (e.type) {
                case S.MESSAGE_TYPE.CHAT:
                    l = G(e.author) ? yield C(e, r, a) : yield w(e, r, a);
                    break;
                case S.MESSAGE_TYPE.GROUP:
                    l = G(e.author) && e.isDirect ? yield C(e, r, a) : yield w(e, r, a);
                    break;
                case S.MESSAGE_TYPE.PEER_BROADCAST:
                    if (t === E.CiphertextType.Skmsg) {
                        if (!e.bclHashValidated)
                            throw new Error("parseMessage: participants for peer broadcast message is not validated");
                        l = yield w(e, r, a)
                    } else
                        l = yield O(e, r, a);
                    break;
                case S.MESSAGE_TYPE.OTHER_BROADCAST:
                    l = yield w(e, r, a);
                    break;
                case S.MESSAGE_TYPE.DIRECT_PEER_STATUS:
                    l = e.isDirect ? yield C(e, r, a) : yield O(e, r, a);
                    break;
                case S.MESSAGE_TYPE.OTHER_STATUS:
                    l = yield w(e, r, a);
                    break;
                default:
                    throw new Error("Unrecognized MESSAGE_TYPE")
                }
            return l
        }
        ))).apply(this, arguments)
    }
    function C() {
        return P.apply(this, arguments)
    }
    function P() {
        return (P = (0,
        n.default)((function*(e, t, r) {
            var {deviceSentMessage: a} = t;
            if (null == a)
                throw new c.DeviceSentMessageError(x(e.author),h.default.DSM_ERROR.MISSING_DSM);
            if (null == a.destinationJid)
                throw new c.DeviceSentMessageError(x(e.author),h.default.DSM_ERROR.INVALID_DSM);
            var {destinationJid: n} = a
              , s = yield R(e, a.message, r);
            return (0,
            i.default)({
                deviceSent: {
                    destination: (0,
                    A.createWid)(n)
                }
            }, s)
        }
        ))).apply(this, arguments)
    }
    function O() {
        return M.apply(this, arguments)
    }
    function M() {
        return (M = (0,
        n.default)((function*(e, t, r) {
            var {deviceSentMessage: a} = t;
            if (null == a)
                throw new c.DeviceSentMessageError(x(e.author),h.default.DSM_ERROR.MISSING_DSM);
            if (null == a.phash)
                throw new c.DeviceSentMessageError(x(e.author),h.default.DSM_ERROR.INVALID_DSM);
            var {phash: n} = a
              , s = yield R(e, a.message, r);
            return (0,
            i.default)({
                deviceSent: {
                    phash: n,
                    info: e
                }
            }, s)
        }
        ))).apply(this, arguments)
    }
    function w() {
        return I.apply(this, arguments)
    }
    function I() {
        return (I = (0,
        n.default)((function*(e, t, r) {
            if (null != t.deviceSentMessage)
                throw new c.DeviceSentMessageError(x(e.author),h.default.DSM_ERROR.INVALID_SENDER);
            var a = yield R(e, t, r);
            return (0,
            i.default)({
                deviceSent: null
            }, a)
        }
        ))).apply(this, arguments)
    }
    function R() {
        return D.apply(this, arguments)
    }
    function D() {
        return (D = (0,
        n.default)((function*(e, t, r) {
            if (null == t)
                return {
                    senderKey: null,
                    storeMsg: null,
                    renderableMsgs: []
                };
            var a = g.default.parseMsgProto(t, k(e), "relay", r)
              , i = null != t.senderKeyDistributionMessage ? N(e, t.senderKeyDistributionMessage) : null
              , n = null;
            if (e.type === S.MESSAGE_TYPE.PEER_BROADCAST && (a.broadcastId = e.chat,
            a.broadcastParticipants = e.bclParticipants,
            a.broadcastEphSettings = e.bclEphSettings,
            n = a),
            e.type === S.MESSAGE_TYPE.OTHER_BROADCAST) {
                a.broadcastId = e.chat;
                var s = e.ephSetting
                  , o = a.ephemeralSharedSecret;
                if (null != s && null != o) {
                    var {ephemeralDuration: l, ephemeralSettingTimestamp: d} = yield(0,
                    u.decodeBroadcastEphemeralSetting)(e.chat, (0,
                    p.getMeUser)(), e.author, s, o);
                    a.ephemeralDuration = l,
                    a.ephemeralSettingTimestamp = d
                }
            }
            var c = [];
            return "unknown" === a.type && null != i || (e.type === S.MESSAGE_TYPE.PEER_BROADCAST ? c = yield U(a, e.bclParticipants, e.bclEphSettings) : ("payment_transaction_request_cancelled" !== a.subtype && "payment_action_request_declined" !== a.subtype || null != a.paymentRequestMessageKey) && (c = [a])),
            {
                senderKey: i,
                storeMsg: n,
                renderableMsgs: c
            }
        }
        ))).apply(this, arguments)
    }
    function N(e, t) {
        if (!e.chat.isGroup() && !e.chat.isBroadcast())
            throw new Error("should not have senderkey");
        var {groupId: r, axolotlSenderKeyDistributionMessage: a} = t;
        if (null == r || e.chat.toString({
            legacy: !0
        }) !== r)
            throw new Error(`senderKeyDistributionMessage: from ${e.chat.toString()} mismatched to ${r || "null"}`);
        if (!a)
            throw new Error(`senderKeyDistributionMessage: from ${e.author.toString()} has no content`);
        return {
            groupId: r,
            key: a
        }
    }
    function L() {
        return (L = (0,
        n.default)((function*(e, t) {
            if (e.edit === d.default.EDIT_ATTR.REVOKE && e.type !== S.MESSAGE_TYPE.PEER_BROADCAST)
                return [];
            var r = k(e);
            return t === S.PlaceholderType.E2E ? r.type = d.default.MSG_TYPE.CIPHERTEXT : (r.type = d.default.MSG_TYPE.UNKNOWN,
            r.subtype = "fanout"),
            (0,
            _.addPlaceHolderAction)(r, t),
            e.type === S.MESSAGE_TYPE.PEER_BROADCAST ? (r.broadcastParticipants = e.bclParticipants,
            r.broadcastEphSettings = e.bclEphSettings,
            (0,
            f.storeMessages)([r], r.id.remote),
            e.edit === d.default.EDIT_ATTR.REVOKE ? [] : yield U(r, e.bclParticipants)) : [r]
        }
        ))).apply(this, arguments)
    }
    function k(e) {
        var t = F(e)
          , r = (0,
        p.getMeUser)()
          , a = {
            id: t,
            from: t.fromMe ? r : t.remote,
            to: t.fromMe ? t.remote : r,
            type: d.default.MSG_TYPE.UNKNOWN,
            t: e.ts || 0,
            ack: d.default.ACK.SENT,
            author: t.participant,
            broadcast: !1,
            notifyName: e.pushname || ""
        };
        return null != e.count && (a.count = e.count),
        a
    }
    function U(e, t, r) {
        return Promise.all(t.map(function() {
            var t = (0,
            n.default)((function*(t) {
                var a, n, s;
                try {
                    a = new m.default({
                        remote: t,
                        fromMe: !0,
                        id: e.id.id
                    })
                } catch (e) {
                    return __LOG__(3)`drop: cannot create MsgKey: ${e.stack}`,
                    null
                }
                var o = r ? r[t.toString()] : null
                  , l = e.ephemeralSharedSecret
                  , d = e.broadcastId;
                null != d && null != o && null != l && ({ephemeralDuration: n, ephemeralSettingTimestamp: s} = yield(0,
                u.decodeBroadcastEphemeralSetting)(d, t, (0,
                p.getMeUser)(), o, l));
                var c = (0,
                i.default)((0,
                i.default)({}, e), {}, {
                    id: a,
                    from: (0,
                    p.getMeUser)(),
                    to: t,
                    broadcast: !0,
                    ephemeralDuration: n,
                    ephemeralSettingTimestamp: s
                });
                return e.protocolMessageKey && (c.protocolMessageKey = new m.default({
                    remote: t,
                    fromMe: !0,
                    id: e.protocolMessageKey.id
                })),
                c
            }
            ));
            return function() {
                return t.apply(this, arguments)
            }
        }())).then((e=>e.filter(Boolean)))
    }
    function G(e) {
        return (0,
        A.toUserWid)(e).equals((0,
        p.getMeUser)())
    }
    function F(e) {
        return e.type === S.MESSAGE_TYPE.OTHER_BROADCAST ? new m.default({
            remote: (0,
            A.toUserWid)(e.author),
            fromMe: !1,
            id: e.externalId
        }) : e.type === S.MESSAGE_TYPE.CHAT ? new m.default({
            remote: e.chat,
            fromMe: G(e.author),
            id: e.externalId
        }) : new m.default({
            remote: e.chat,
            fromMe: G(e.author),
            participant: (0,
            A.toUserWid)(e.author),
            id: e.externalId
        })
    }
    function x(e) {
        return null == e.device || e.device === d.default.DEVICE.PRIMARY_DEVICE ? h.default.DEVICE_TYPE.PRIMARY : h.default.DEVICE_TYPE.COMPANION
    }
    function B(e) {
        return e.type === S.MESSAGE_TYPE.CHAT ? e.author : e.chat
    }
}