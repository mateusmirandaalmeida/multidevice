(e,t)=>{
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.PromiseQueueMap = t.PromiseQueue = void 0;
    t.PromiseQueue = class {
        constructor(e=-1) {
            this._promise = Promise.resolve(),
            this._maxDelay = e
        }
        wait() {
            return this._promise
        }
        enqueueHandlers(e, t, a) {
            var i = this._promise.then((()=>e)).then(t, a)
              , n = i.then();
            return this._promise = r(i, this._maxDelay),
            n
        }
        enqueue(e) {
            var t = this._promise.then(e)
              , a = t.then();
            return this._promise = r(t, this._maxDelay),
            a
        }
    }
    ;
    function r(e, t) {
        return t >= 0 ? new Promise((r=>{
            var a = ()=>{
                r()
            }
            ;
            e.then(a, a),
            setTimeout(a, t)
        }
        )) : e.then(a, a)
    }
    function a() {}
    t.PromiseQueueMap = class {
        constructor(e=-1) {
            this._map = new Map,
            this._maxDelay = e
        }
        waitIfPending(e) {
            return this._map.get(e)
        }
        wait(e) {
            return this._map.get(e) || Promise.resolve()
        }
        enqueueHandlers(e, t, r, a) {
            var i = this.wait(e).then((()=>t)).then(r, a);
            return this._addToMap(e, i)
        }
        enqueue(e, t) {
            var r = this.wait(e).then(t);
            return this._addToMap(e, r)
        }
        _addToMap(e, t) {
            var a, i = t.then(), n = ()=>{
                this._map.get(e) === a && this._map.delete(e)
            }
            ;
            return a = r(t, this._maxDelay).then(n, n),
            this._map.set(e, a),
            i
        }
    }
}