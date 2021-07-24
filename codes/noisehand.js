(e,t,r)=>{
        "use strict";
        var a = r(71954);
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),

        t.NoiseHandshake = void 0;
        var i = r(81291);
        var n = a(r(1792));
        var s = r(3854);
        var o = r(1136);
        var l = r(76770);
        var d = Promise.reject("UNINITIALIZED HANDSHAKE");
        var u = new Uint8Array(0);

        d.catch((()=>{}));

        function c(e) {
            var t = new ArrayBuffer(12);
            return new DataView(t).setUint32(8, e),
            new Uint8Array(t)
        }

        function p(e, t=["encrypt", "decrypt"]) {
            return self.crypto.subtle.importKey("raw", new Uint8Array(e), "AES-GCM", !1, t)
        }

        function f(e, t) {
            return n.extract(new Uint8Array(e), t).then((e=>n.expand(new Uint8Array(e), "", 64))).then((e=>[e.slice(0, 32), e.slice(32)]))
        }

        function h(e) {
            e.catch((()=>{}
            ))
        }

        t.NoiseHandshake = class {
            constructor(e) {
                this._hash = d,
                this._salt = d,
                this._cryptoKey = d,
                this._counter = 0,
                this._socket = e,
                this._rejectOnClose = new l.Resolvable,
                e.onClose = ()=>{
                    this._rejectOnClose.reject(new s.Disconnected("NoiseHandshake: SocketClosed"))
                }
                ,
                h(this._rejectOnClose.promise)
            }

            start(e, t) {
                var r = i.Binary.build(e).readBuffer();
                var a = 32 === r.byteLength ? Promise.resolve(r) : self.crypto.subtle.digest("SHA-256", r);

                this._hash = a,
                this._salt = a,
                this._cryptoKey = a.then(p),
                this.authenticate(t)
            }

            sendAndReceive(e) {
                var t = this._socket;
                var r = new Promise(( r => {
                        t.onFrame = e => {
                            t.onFrame = null,
                            r(e)
                        }
                        ,
                        t.sendFrame(e)
                    }
                ));
                
                return this._orRejectOnClose(r)
            }

            send(e) {
                this._socket.sendFrame(e)
            }

            authenticate(e) {
                this._hash = Promise.all([this._hash, e]).then((([e,t])=>{
                    var r = i.Binary.build(e, t).readByteArray();
                    return self.crypto.subtle.digest("SHA-256", r)
                }
                ))
            }

            encrypt(e) {
                var t = this._counter++
                  , r = Promise.all([this._cryptoKey, this._hash, e]).then((([e,r,a])=>function(e, t, r, a) {
                    return self.crypto.subtle.encrypt({
                        name: "AES-GCM",
                        iv: c(t),
                        additionalData: r ? new Uint8Array(r) : u
                    }, e, a)
                }(e, t, r, a)));
                return this.authenticate(r),
                this._orRejectOnClose(r)
            }

            decrypt(e) {
                var t = this._counter++
                  , r = Promise.all([this._cryptoKey, this._hash]).then((([r,a])=>function(e, t, r, a) {
                    return self.crypto.subtle.decrypt({
                        name: "AES-GCM",
                        iv: c(t),
                        additionalData: r ? new Uint8Array(r) : u
                    }, e, a)
                }(r, t, a, e)));
                return this.authenticate(e),
                this._orRejectOnClose(r)
            }

            finish() {
                var e = this._salt.then((e=>f(e, new Uint8Array(0)))).then((([e,t])=>Promise.all([p(e, ["encrypt"]), p(t, ["decrypt"])]))).then((([e,t])=>new o.NoiseSocket(this._socket,e,t)));
                return this._orRejectOnClose(e)
            }

            mixIntoKey(e) {
                this._counter = 0;
                var t = Promise.all([this._salt, e]).then((([e,t])=>f(e, new Uint8Array(t))));
                this._salt = t.then((e=>e[0])),
                this._cryptoKey = t.then((e=>p(e[1]))),
                h(this._salt),
                h(this._cryptoKey)
            }

            _orRejectOnClose(e) {
                return Promise.race([e, this._rejectOnClose.promise]).then((e=>this._rejectOnClose.resolveWasCalled() ? this._rejectOnClose.promise : e))
            }
        }
    }