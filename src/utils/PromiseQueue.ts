function r(e, t) {
    return t >= 0 ? new Promise((r=>{
        var a = ()=>{
            r(t)
        }
        ;
        e.then(a, a),
        setTimeout(a, t)
    }
    )) : e.then(a, a)
}

function a() {}

export class PromiseQueue {
    private promise: any;
    private maxDelay = -1;

    constructor(e=-1) {
        this.promise = Promise.resolve();
        this.maxDelay = e;
    }

    wait() {
        return this.promise;
    }

    enqueueHandlers(e, t, a = undefined) {
        var i = this.promise.then((()=>e)).then(t, a)
          , n = i.then();
        return this.promise = r(i, this.maxDelay),
        n
    }

    enqueue(e) {
        var t = this.promise.then(e)
          , a = t.then();
        return this.promise = r(t, this.maxDelay),
        a
    }
}

export class PromiseQueueMap {
    private map: Map<any, any>;
    private maxDelay = -1;

    constructor(e=-1) {
        this.map = new Map,
        this.maxDelay = e
    }
    waitIfPending(e) {
        return this.map.get(e)
    }
    wait(e) {
        return this.map.get(e) || Promise.resolve()
    }
    enqueueHandlers(e, t, r, a = undefined) {
        var i = this.wait(e).then((()=>t)).then(r, a);
        return this._addToMap(e, i)
    }
    enqueue(e, t) {
        var r = this.wait(e).then(t);
        return this._addToMap(e, r)
    }
    _addToMap(e, t) {
        var a, i = t.then(), n = ()=>{
            this.map.get(e) === a && this.map.delete(e)
        }
        ;
        return a = r(t, this.maxDelay).then(n, n),
        this.map.set(e, a),
        i
    }
}
    
