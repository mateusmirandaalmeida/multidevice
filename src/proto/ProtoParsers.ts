import { Binary } from './Binary';
import { WapJidProps } from './WapJidProps';

var l = '@system';
var p = 0;

function _() {
    return castToUnixTime(Date.now() / 1e3 - p);
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

const decodeAsString = (e) => {
    if ('string' != typeof e) throw new Error(`decodeAsString: attribute is ${typeof e} not a string: ${e}`);
    return e;
};

const toChatWid = function (e) {
    if (e.isUser()) return toUserWid(e);
    return e;
};

class u {
    private parser;
    private reason;

    constructor(e, t) {
        (this.parser = e), (this.reason = t);
    }
    toString() {
        return `XmppParsingFailure: ${this.parser}: ${this.reason}`;
    }
}

class c {
    private _name;
    private _node;
    private _children;
    private _me;

    constructor(e, t, _me?) {
        this._me = _me;
        (this._name = e), (this._node = t), (this._children = Array.isArray(t.content) ? t.content.map((t) => new c(e, t, _me)) : null);
    }
    hasAttr(e) {
        return this._node.attrs.hasOwnProperty(e);
    }
    assertTag(e) {
        this._node.tag !== e && this.throw(`to be <${e}>`);
    }
    tag() {
        return this._node.tag;
    }
    maybeChild(e) {
        var t = this._children;
        if (!t) return null;
        for (var r = 0; r < t.length; r++) if (t[r]._node.tag === e) return t[r];
        return null;
    }
    hasChild(e) {
        return !!this.maybeChild(e);
    }
    child(e) {
        var t = this.maybeChild(e);
        return t || this.throw(`to have child <${e}>`);
    }
    getFirstChild() {
        var e = this._children;
        return e ? e[0] : null;
    }
    assertAttr(e, t) {
        var r = this.attrString(e);
        r !== t && this.throw(`to have "${e}"="${t}", but instead has "${r}"`);
    }
    assertAttrIsMe(e) {
        var t = this.attrWid(e),
            r = this._me;
        t.equals(r) || this.throw(`to have "${e}"=${r.toString()}, but instead has "${t.toString()}"`);
    }
    assertAttrIsMeUser(e) {
        var t = this.attrWid(e),
            r = this._me;
        t.equals(r) || this.throw(`to have "${e}"=${r.toString()}, but instead has "${t.toString()}"`);
    }
    assertFromServer() {
        var e = this.attrString('from');
        's.whatsapp.net' !== e && this.throw(`to have "from"="s.whatsapp.net", but instead has "${e}"`);
    }
    attrString(e) {
        return this._node.attrs.hasOwnProperty(e) ? decodeAsString(this._node.attrs[e].toString()) : this.throw(`to have attribute "${e}"`);
    }
    attrAuthor(e) {
        if (!this.hasAttr(e)) return l;
        var t = this.attrUserWid(e);
        return t.equals(this._me) ? '@me' : t;
    }
    maybeAttrString(e) {
        return this.hasAttr(e) ? decodeAsString(this._node.attrs[e]) : null;
    }
    attrDeviceWid(e) {
        var t,
            r = this.attrString(e);
        try {
            t = new WapJidProps(r);
        } catch (e) {}
        return t && t.isUser() ? t : this.throw(`to have "${e}"={DeviceJid}, but instead has "${r}"`);
    }
    attrUserWid(e) {
        var t,
            r = this.attrString(e);
        try {
            t = new WapJidProps(r);
        } catch (e) {}
        return t && t.isUser() ? toUserWid(t) : this.throw(`to have "${e}"={UserJid}, but instead has "${r}"`);
    }
    attrChatWid(e) {
        var t,
            r = this.attrString(e);
        try {
            t = new WapJidProps(r);
        } catch (e) {}
        return t ? toChatWid(t) : this.throw(`to have "${e}"={ChatJid}, but instead has "${r}"`);
    }
    attrGroupWid(e) {
        var t,
            r = this.attrString(e);
        try {
            t = new WapJidProps(r);
        } catch (e) {}
        return t && t.isGroup() ? t : this.throw(`to have "${e}"={GroupJid}, but instead has "${r}"`);
    }
    attrWid(e) {
        var t,
            r = this.attrString(e);
        try {
            t = new WapJidProps(r);
        } catch (e) {}
        return t || this.throw(`to have "${e}"={JID}, but instead has "${r}"`);
    }
    maybeAttrEnum(e, t) {
        if (!this.hasAttr(e)) return null;
        try {
            return this.attrEnum(e, t);
        } catch (e) {
            null;
        }
    }
    attrEnum(e, t) {
        var r: any = this.attrString(e);
        if (!t.hasOwnProperty(r)) {
            var a = Object.keys(t).join('|');
            return this.throw(`to have "${e}"={${a}} but has value "${r}"`);
        }
        return t[r];
    }
    attrEnumOrDefault(e, t, r) {
        return this.hasAttr(e) ? this.attrEnum(e, t) : r;
    }
    attrFlowEnum(e, t) {
        var r = t(this.attrString(e));
        return null == r ? this.throw('to have enum value') : r;
    }
    attrFlowEnumOrDefault(e, t, r) {
        try {
            return this.attrFlowEnum(e, t);
        } catch (e) {
            return r;
        }
    }
    attrInt(e, t?, r?) {
        var a: any = this.attrString(e),
            i = parseInt(a, 10);
        return Number.isNaN(i)
            ? this.throw(`to have "${e}"={integer} but has value "${a}"`)
            : void 0 !== t && i < t
            ? this.throw(`to have "${e}"={at least ${t}} but has value ${i}`)
            : void 0 !== r && i >= r
            ? this.throw(`to have "${e}"={below ${r}} but has value ${i}`)
            : i;
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
    forEachChild(e) {
        var t = this._children;
        if (t) t.forEach(e);
        else if (this._node.content) return this.throw('to have children');
    }
    forEachChildWithTag(e, t) {
        this.forEachChild((r) => {
            r._node.tag === e && t(r);
        });
    }
    mapChildren(e) {
        var t = this._children;
        return !t && this._node.content ? this.throw('to have children') : t ? t.map(e) : [];
    }
    mapChildrenWithTag(e, t) {
        var r = this._children;
        return !r && this._node.content ? this.throw('to have children') : r ? r.filter((t) => t._node.tag === e).map(t) : [];
    }
    hasContent() {
        return !this._children && !!this._node.content;
    }
    contentUint(e) {
        return d(this.contentBytes(e), e);
    }
    contentBytes(e = -1) {
        if (this._children) return this.throw('to have binary content, but has children instead');
        if (this._node.content) {
            var t = this._node.content;
            return -1 !== e && t.length !== e ? this.throw(`to be ${e} bytes, but got ${t.length} instead`) : t;
        }
        return this.throw('to have content');
    }
    contentString() {
        if (this._children) return this.throw('to have string content, but has children instead');
        if (this._node.content) {
            var e = new Binary(this._node.content);
            return e.readString(e.size());
        }
        return this.throw('to have content');
    }
    contentEnum(e) {
        var t = this.contentString();
        if (!e.hasOwnProperty(t)) {
            var r = Object.keys(e).join('|');
            return this.throw(`to have content {${r}} but has value "${t}"`);
        }
        return e[t];
    }
    throw(e) {
        throw new u(this._name, `expected <${this._node.tag}> ${e}`);
    }
}

export const retryRequestParser = (stanza) => {
    const e = new c(stanza.tag, stanza);
    e.assertTag('receipt'), e.assertAttr('type', 'retry'), e.hasAttr('to') && e.assertAttrIsMe('to');
    var t = e.attrWid('from'),
        r = e.hasAttr('participant') ? e.attrDeviceWid('participant') : null,
        a = e.hasAttr('recipient') ? e.attrUserWid('recipient') : null,
        i = e.child('retry'),
        n = e.maybeChild('keys'),
        s = null;
    if (null != n) {
        var o,
            l = n.child('skey'),
            d = n.child('key');
        s = {
            identity: n.child('identity').contentBytes(32),
            deviceIdentity: null === (o = n.maybeChild('device-identity')) || void 0 === o ? void 0 : o.contentBytes(),
            skey: {
                id: l.child('id').contentUint(3),
                pubkey: l.child('value').contentBytes(32),
                signature: l.child('signature').contentBytes(64),
            },
            key: {
                id: d.child('id').contentUint(3),
                pubkey: d.child('value').contentBytes(32),
            },
        };
    }
    return {
        stanzaId: e.attrString('id'),
        originalMsgId: i.attrString('id'),
        ts: e.attrTime('t'),
        retryCount: i.hasAttr('count') ? i.attrInt('count') : 0,
        regId: e.child('registration').contentUint(4),
        offline: e.hasAttr('offline'),
        from: t,
        participant: r,
        recipient: a,
        keyBundle: s,
    };
};

export const e2eSessionParser = (stanza, me) => {
    const e = new c(stanza.tag, stanza.content[0].content[0], me);
    if (e.hasChild('error')) {
        var t = e.child('error'),
            r = t.attrInt('code'),
            a = t.attrString('text');
        throw new Error(`establishE2ESessionParser bad response: ${r} ${a}`);
    }
    var i = e.child('skey'),
        n = e.hasChild('key') ? e.child('key') : null,
        s = e.hasChild('device-identity') ? e.child('device-identity').contentBytes() : null;
    return {
        wid: e.attrDeviceWid('jid'),
        regId: e.child('registration').contentUint(4),
        identity: e.child('identity').contentBytes(32),
        deviceIdentity: s,
        skey: {
            id: i.child('id').contentUint(3),
            pubkey: i.child('value').contentBytes(32),
            signature: i.child('signature').contentBytes(64),
        },
        key: n && {
            id: n.child('id').contentUint(3),
            pubkey: n.child('value').contentBytes(32),
        },
    };
};

export const deviceParser = (stanza, me) => {
    const e = new c('deviceParser', stanza, me);
    e.assertTag('devices');
    var t = e.maybeChild('error');
    if (t)
        return {
            errorCode: t.attrInt('code'),
            errorText: t.attrString('text'),
        };
    var r = e.maybeChild('key-index-list'),
        a = e.maybeChild('device-list'),
        i =
            null == r
                ? null
                : {
                      ts: r.attrTime('ts'),
                      signedKeyIndexBytes: r.contentBytes(),
                  };
    return {
        deviceList:
            null == a
                ? void 0
                : a.mapChildrenWithTag('device', (e) => ({
                      id: e.attrInt('id'),
                      keyIndex: e.hasAttr('key-index') ? e.attrInt('key-index') : null,
                  })),
        keyIndex: i,
    };
};
