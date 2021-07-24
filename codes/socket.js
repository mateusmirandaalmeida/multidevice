(e,t,r)=>{
    "use strict";
    var a = r(95318)
      , i = r(20862);
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.startComms = function(e, t, r) {
        if (T)
            return;
        T = new S(e,t,r),
        setTimeout(A, 0)
    }
    ,
    t.stopComms = function(e) {
        e && p.default.onStartingLogout();
        var t = O("stopComms");
        t.socketLoop.endWithValue(),
        t.socket && t.socket.close();
        T = null
    }
    ,
    t.openSocketLoop = A,
    t.openSocket = b,
    t.closeSocket = function() {
        var e = O("closeSocket").socket;
        e && (__LOG__(2)`closeSocket called`,
        e.close())
    }
    ,
    t.onStreamErrorReceived = function() {
        O("onStreamErrorReceived").socketLoop.cancelReset()
    }
    ,
    t.waitForConnection = function() {
        O("waitForConnection").sendPing(),
        y || (y = new o.Resolvable);
        return y.promise
    }
    ,
    t.sendStanzaAndWaitForAck = function(e, t) {
        return C(e, t).then((()=>{}
        ))
    }
    ,
    t.sendStanzaAndReturnAck = C,
    t.castStanza = function(e) {
        var t = O("castStanza");
        t.socket ? t.castStanza(e) : __LOG__(2)`Comms has no open socket`
    }
    ,
    t.sendIq = function(e, t, r) {
        return P(e, t, !1, r)
    }
    ,
    t.sendIqWithoutRetry = function(e, t) {
        return P(e, t, !0)
    }
    ,
    t.sendPing = function(e, t) {
        var r = O("sendPing")
          , a = e.attrs.id;
        if (!a || "string" != typeof a)
            return Promise.reject(new Error(`Comms:sendPing given iq without id: ${String(e)}`));
        if (!r.socketId)
            return __LOG__(2)`sendPing when socket dead`,
            Promise.resolve();
        if (r.activePing && r.activePing.socketId === r.socketId)
            return __LOG__(2)`sendPing ping still pending`,
            Promise.resolve();
        r.activePing && r.activePing.handler.resolve();
        var i = new o.Resolvable;
        return r.activePing = {
            socketId: r.socketId,
            stanzaId: a,
            handler: i
        },
        r.callStanza(e),
        i.promise.then((e=>e && (0,
        v.parseIqResponse)(t, e)))
    }
    ,
    t.startHandlingRequests = function() {
        return O("startHandlingRequests").startHandlingRequests()
    }
    ,
    t.singletonOrThrowIfUninitialized = O;
    var n = r(24488)
      , s = r(5749)
      , o = r(76770)
      , l = r(20014)
      , d = r(35148)
      , u = r(45168)
      , c = i(r(27862))
      , p = a(r(97420))
      , f = a(r(46274))
      , h = r(92246)
      , _ = r(97729)
      , m = a(r(82137))
      , g = a(r(40956))
      , v = r(65131)
      , y = (r(68042),
    null)
      , E = 1;
    class S {
        constructor(e, t, r) {
            this.nextSocketId = 1,
            this.pendingIqs = new Map,
            this.ackHandlers = [],
            this._recvBlocker = new o.Resolvable,
            this.activePing = null,
            this._pending = new Set,
            this.socketId = 0,
            this.socket = null,
            this.softCloseSocket = null,
            this.socketLoop = new s.PromiseRetryLoop({
                name: "MainSocketLoop",
                code: b,
                timer: {
                    jitter: .1,
                    max: 6e4,
                    algo: {
                        type: "fibonacci",
                        first: 1e4,
                        second: 1e4
                    },
                    relativeDelay: !0
                },
                resetDelay: 3e4
            }),
            this.parseAndHandleStanza = (e,t)=>{
                e === this.socketId && (this.deadSocketTimer.cancel(),
                y && (y.resolve(),
                y = null));
                var r = (0,
                n.decodeStanza)(t, w).then((t=>{
                    if (t) {
                        var r = this.activePing;
                        return r && r.socketId === e && r.stanzaId === M(t) ? (this.activePing = null,
                        r.handler.resolve(t),
                        this.maybeScheduleHealthCheck(),
                        "NO_ACK") : this.handleStanza(t, e)
                    }
                    __LOG__(3)`Failure parsing stanza!`
                }
                )).then((t=>{
                    if (e === this.socketId)
                        if ("CLOSE_SOCKET" === t) {
                            __LOG__(2)`Comms: job response is CLOSE_SOCKET`;
                            var r = this.socket;
                            r && r.close()
                        } else
                            "NO_ACK" === t ? __LOG__(2)`Comms: job response is NO_ACK` : t && this.castStanza(t)
                }
                ));
                this._pending.add(r),
                r.finally((()=>{
                    this._pending.delete(r)
                }
                ))
            }
            ,
            this.handleStanza = (e,t)=>{
                var r = M(e);
                if (null != r) {
                    var a = this.pendingIqs.get(r);
                    a ? (this.pendingIqs.delete(r),
                    a.resolve(e),
                    this.maybeScheduleHealthCheck()) : __LOG__(4, void 0, new Error)`handleIq no handler for iq with id ${r}`
                } else {
                    if ("ack" !== e.tag)
                        return "failure" === e.tag ? this._handleStanza(e, t) : this._recvBlocker.promise.then((()=>this._handleStanza(e, t)));
                    this.handleAck(e)
                }
                return "NO_ACK"
            }
            ,
            this.healthCheckTimer = new l.ShiftTimer((()=>{
                __LOG__(2)`Comms: testing socket`,
                this.socketId && this.sendPing()
            }
            )),
            this.deadSocketTimer = new l.ShiftTimer((e=>{
                __LOG__(2)`Comms: Socket ${e} expired`,
                e === this.socketId && this.softCloseSocket && this.softCloseSocket()
            }
            )),
            this._handleStanza = e,
            this.sendPing = t,
            this.socketStartOptions = r
        }
        filterPending(e) {
            var t = [];
            function r(r) {
                e(r) && t.push(r)
            }
            return this.pendingIqs.forEach(r),
            this.ackHandlers.forEach(r),
            t
        }
        callStanza(e) {
            this.castStanza(e),
            this.deadSocketTimer.onOrBefore(2e4, this.socketId),
            this.healthCheckTimer.cancel()
        }
        castStanza(e) {
            var t = this.socketOrThrow("castStanza");
            try {
                t.sendFrame((0,
                n.encodeStanza)(e))
            } catch (e) {
                __LOG__(3)`castStanza error ${e}`
            }
        }
        socketOrThrow(e) {
            var t = this.socket;
            if (t)
                return t;
            throw new Error(`Comms.${e} called while no socket`)
        }
        startHandlingRequests() {
            return __LOG__(2)`Comms.startHandlingRequests`,
            this._recvBlocker.resolve(),
            this._recvBlocker.promise.then((()=>{}
            ))
        }
        handleAck(e) {
            for (var t = this.ackHandlers, r = -1, a = null; !a && ++r < t.length; )
                a = t[r].parseAndTest(e);
            if (a) {
                var i = t[r];
                (0,
                d.removeIndexWithoutPreservingOrder)(t, r),
                (0,
                g.default)(e),
                i.resolve(a),
                this.maybeScheduleHealthCheck()
            } else
                __LOG__(3)`handleAck: unrecognized ${e}`
        }
        removeHandler(e) {
            if ("iq" === e.type) {
                var t = e.stanza.attrs.id;
                if (!t || "string" != typeof t)
                    return;
                if (!this.pendingIqs.delete(t))
                    return
            } else {
                e.type;
                var r = this.ackHandlers.indexOf(e);
                if (-1 === r)
                    return;
                (0,
                d.removeIndexWithoutPreservingOrder)(this.ackHandlers, r)
            }
            e.resolve(Promise.reject(new h.Disconnected))
        }
        maybeScheduleHealthCheck() {
            if (!this.healthCheckTimer.isScheduled() && !(this.activePing || this.ackHandlers.length || this.pendingIqs.size)) {
                var e = 1e4 * Math.random() + 2e4;
                this.healthCheckTimer.onOrBefore(e)
            }
        }
    }
    var T = null;
    function A() {
        O("openSocketLoop").socketLoop.start()
    }
    function b() {
        var e, t = O("openSocket"), r = t.nextSocketId++;
        return __LOG__(2)`Comms: Socket ${r} opening, passive mode: ${!!(null === (e = t.socketStartOptions) || void 0 === e ? void 0 : e.passive)}`,
        p.default.setSocketState(f.default.SOCKET_STATE.OPENING),
        (0,
        m.default)(t.socketStartOptions).then((e=>{
            t.socketStartOptions = null,
            p.default.setSocketState(f.default.SOCKET_STATE.PAIRING);
            var a = new o.Resolvable;
            return __LOG__(2)`Comms: Socket ${r} opened`,
            t.socketId = r,
            t.socket = e,
            t.softCloseSocket = ()=>{
                t.softCloseSocket = null,
                t.socket && (t.socket.close(),
                t.socket = null),
                a.resolve()
            }
            ,
            t.socketLoop.resetTimeoutAfter(1e4),
            t.deadSocketTimer.cancel(),
            t.maybeScheduleHealthCheck(),
            e.setOnFrame((e=>t.parseAndHandleStanza(r, e))),
            e.setOnClose((()=>{
                __LOG__(2)`Comms: Socket ${r} closed`,
                t.activePing && r === t.activePing.socketId && (t.activePing.handler.resolve(),
                t.activePing = null),
                t.filterPending((e=>e.attachedToSocketId === r)).forEach((e=>{
                    t.removeHandler(e)
                }
                )),
                r === t.socketId && (t.socketId = 0,
                t.socket = null,
                p.default.socketStreamDisconnected(),
                a.resolve())
            }
            )),
            (0,
            _.isRegistered)() && (p.default.setSocketState(f.default.SOCKET_STATE.CONNECTED),
            p.default.openSocketStream()),
            t.filterPending((e=>!e.attachedToSocketId)).sort(((e,t)=>e.orderedId - t.orderedId)).forEach((e=>{
                t.callStanza(e.stanza)
            }
            )),
            a.promise
        }
        )).catchType(h.Disconnected, (()=>{
            __LOG__(2)`openSocket socket closed while in noise handshake`
        }
        )).catch((e=>{
            __LOG__(3)`openSocket failed ${e}`
        }
        ))
    }
    function C(e, t) {
        return new Promise((r=>{
            var a = O("sendStanzaAndWaitForAck");
            a.ackHandlers.push({
                type: "ack",
                parseAndTest: e=>{
                    var r = c.default.parse(e);
                    return !r.error && (0,
                    c.ackMatchesTemplate)(r.success, t) ? e : null
                }
                ,
                resolve: r,
                stanza: e,
                attachedToSocketId: 0,
                orderedId: E++
            }),
            a.socket ? a.callStanza(e) : __LOG__(2)`Comms has no open socket, will send stanza when socket opens`
        }
        ))
    }
    function P(e, t, r, a) {
        return new Promise((t=>{
            var a = O("sendIq")
              , i = e.attrs.id;
            if (!i || "string" != typeof i)
                throw new Error(`Comms:sendIq given iq without id: ${String(e)}`);
            var n = a.socketId;
            !r || n ? (a.pendingIqs.set(i, {
                type: "iq",
                resolve: t,
                stanza: e,
                attachedToSocketId: r ? n : 0,
                orderedId: E++
            }),
            a.socket ? a.callStanza(e) : __LOG__(2)`Comms has no open socket, will resend iq when socket opens`) : t(Promise.reject(new h.Offline))
        }
        )).then((e=>(0,
        v.parseIqResponse)(t, e, a)))
    }
    function O(e) {
        if (T)
            return T;
        throw new Error(`Comms::${e} called before startComms`)
    }
    function M(e) {
        if ("iq" === e.tag) {
            var t = e.attrs.type;
            if ("result" === t || "error" === t)
                return (0,
                n.decodeAsString)(e.attrs.id) || null
        }
        return null
    }
    function w(e) {
        return Promise.resolve((0,
        u.inflate)(e))
    }
}