import { Binary } from '../proto/Binary';
import { Wid } from '../proto/Wid';

var r = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70]
          , a = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102];

function _() {
    return castToUnixTime(Date.now() / 1e3);
}

function d(e, t?, r = !1) {
    for (var a = 0, i = 0; i < t; i++) a = 256 * a + e[i];
    return a;
}

function castToUnixTime(e) {
    var u = -2147483647,
        d = 2147483647;
    return Math.max(u, Math.min(0 | e, d));
}

function toUserWid(e) {
    if (!e.isUser()) throw new Error('asUserWid: wid is not a user wid');
    return (null != e.device && 0 !== e.device) || (null != e.agent && 0 !== e.agent) ? d(e.user) : e;
}

const futureUnixTime = function (e, t?) {
    var r = null != t ? t : _();
    return castToUnixTime(Math.ceil(r + Math.max(e, 0)));
};

const toChatWid = function (e) {
    if (e.isUser()) return toUserWid(e);
    return e;
};

export class WapNode {
    public tag: any;
    public attrs: any;
    public content: any;

    constructor(tag: string, attrs = {}, content = null) {
        this.tag = tag;
        this.attrs = attrs;
        this.content = content;
    }

    contentString() {
        const data = new Binary(this.content);
        return data.readString(data.size());
    }

    contentBytes(size = -1) {
        return this.content;
    }

    contentUint(e) {
        return d(this.contentBytes(e), e);
    }

    attrInt(e, t?, r?) {
        const value = this.attrString(e);
        const intValue = parseInt(value, 10);

        return Number.isNaN(intValue)
            ? this.throw(`to have "${e}"={integer} but has value "${value}"`)
            : void 0 !== t && intValue < t
            ? this.throw(`to have "${e}"={at least ${t}} but has value ${intValue}`)
            : void 0 !== r && intValue >= r
            ? this.throw(`to have "${e}"={below ${r}} but has value ${intValue}`)
            : intValue;
    }

    maybeAttrInt(e, t, r) {
        return this.hasAttr(e) ? this.attrInt(e, t, r) : null;
    }

    attrTime(e) {
        return castToUnixTime(this.attrInt(e));
    }

    attrFutureTime(e) {
        var t = this.attrInt(e);
        return futureUnixTime(t);
    }

    getContentByTag(tagName: string): WapNode {
        if (!Array.isArray(this.content)) {
            return null;
        }

        return this.content.find((node) => node.tag == tagName);
    }

    maybeChild(tag: string) {
        if (!this.content || !Array.isArray(this.content)) {
            return null;
        }

        return <WapNode>this.content.find((node: WapNode) => node.tag == tag);
    }

    mapChildrenWithTag(tag: string, callback: any) {
        if (!this.content || !Array.isArray(this.content)) {
            return null;
        }

        return this.content.filter((node) => node.tag == tag).map(callback);
    }

    forEachChildWithTag(tag: string, callback: any) {
        if (!this.content || !Array.isArray(this.content)) {
            return null;
        }

        return this.content.filter((node) => node.tag == tag).forEach(callback);
    }

    hasChild(tag: string) {
        return !!this.maybeChild(tag);
    }

    child(tag: string) {
        return this.maybeChild(tag);
    }

    hasAttr(attr: string) {
        return this.attrs.hasOwnProperty(attr);
    }

    attrsToString(e) {
        for (var t = Object.keys(e), r = '', a = 0; a < t.length; a++) {
            var i = t[a];
            r += ` ${i}="${e[i].toString()}"`;
        }
        return r;
    }

    attrAuthor(jid, me) {
        if (!this.hasAttr(jid)) {
            return '@system;';
        }
        
        var user = this.attrUserWid(jid);
        return user.equals(me) ? '@me' : user;
    }

    maybeAttrString(e) {
        return this.hasAttr(e) && typeof this.attrs[e]?.toString() == 'string' ? this.attrs[e]?.toString() : null;
    }

    attrString(e) {
        return this.attrs.hasOwnProperty(e) && typeof this.attrs[e].toString() == 'string' ? this.attrs[e].toString() : this.throw(`to have attribute "${e}"`);
    }

    attrDeviceWid(e) {
        let wid = null;
        const jid = this.attrString(e);

        try {
            wid = new Wid(jid);
        } catch (e) {}

        return wid && wid.isUser() ? wid : this.throw(`to have "${e}"={DeviceJid}, but instead has "${jid}"`);
    }

    attrUserWid(e) {
        let wid = null;
        const jid = this.attrString(e);

        try {
            wid = new Wid(jid);
        } catch (e) {}

        return wid && wid.isUser() ? toUserWid(wid) : this.throw(`to have "${e}"={UserJid}, but instead has "${jid}"`);
    }

    attrMaybeUserWid(e) {
        let wid = null;
        const jid = this.maybeAttrString(e);
        if (!jid) {
            return null;
        }

        try {
            wid = new Wid(jid);
        } catch (e) {}

        return wid && wid.isUser() ? toUserWid(wid) : this.throw(`to have "${e}"={UserJid}, but instead has "${jid}"`);
    }

    attrChatWid(e) {
        let wid = null;
        const jid = this.attrString(e);

        try {
            wid = new Wid(jid);
        } catch (e) {}
        
        return wid ? toChatWid(wid) : this.throw(`to have "${e}"={ChatJid}, but instead has "${jid}"`);
    }

    attrGroupWid(e) {
        let wid = null;
        const jid = this.attrString(e);

        try {
            wid = new Wid(jid);
        } catch (e) {}
        
        return wid && wid.isGroup() ? wid : this.throw(`to have "${e}"={GroupJid}, but instead has "${jid}"`);
    }

    attrWid(e) {
        let wid = null;
        const jid = this.attrString(e);

        try {
            wid = new Wid(jid);
        } catch (e) {}
        
        return wid || this.throw(`to have "${e}"={JID}, but instead has "${jid}"`);
    }

    uint8ArrayToDebugString(e) {
        return 0 === e.length ? '\x3c!-- empty binary --\x3e' : e.length < 50 ? this.bytesToDebugString(e) : `\x3c!-- ${e.length} bytes --\x3e`;
    }

    i(e) {
        for (var t = [], a = 0; a < e.length; a++) {
            var i = e[a];
            t.push(r[i >> 4], r[15 & i])
        }
        return String.fromCharCode.apply(String, t)
    }

    bytesToDebugString(e) {
        var t = !0,
            r = e.length;
        for (; t && r; ) {
            var a = e[--r];
            t = 32 <= a && a < 127;
        }
        return t ? JSON.stringify(String.fromCharCode.apply(String, e)) : this.i(e);
    };

    toString() {
        var e = '<' + this.tag;
        e += this.attrsToString(this.attrs);
        var t = this.content;
        return Array.isArray(t) ? (e += `>${t.map(String).join('')}</${this.tag}>`) : (e += t ? `>${this.uint8ArrayToDebugString(t)}</${this.tag}>` : ' />'), e;
    }

    throw(e) {
        throw new Error(`expected <${this.tag}> ${e}`);
    }
}
