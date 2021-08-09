import { OFFICIAL_BIZ_WID, USER_JID_SUFFIX } from '../utils/Utils';

interface WapJidProps {
    type: number;
    user: any;
    device?: any;
    agent?: any;
    server?: any;
}

export class WapJid {
    public static JID = 0;
    public static JID_AD = 1;

    private _jid: WapJidProps;
    // private jid: WapJidProps;
    private _serialized: string;

    constructor(jid: WapJidProps) {
        // this._jid = jid;
        this._jid = jid;
    }

    static createAD(user: string, agent: number, device: number) {
        return new WapJid({
            type: WapJid.JID_AD,
            user,
            device: device ?? 0,
            agent: agent ?? 0,
            server: 's.whatsapp.net',
        });
    }

    static create(user: string, server?: string, device?) {
        return new WapJid({
            type: WapJid.JID,
            user,
            server,
            ...(device || device == 0 ? { device } : {}),
        });
    }

    toString() {
        if (this._jid.type === WapJid.JID_AD) {
            var { user: e, agent: t, device: r } = this._jid,
                n = USER_JID_SUFFIX;
            return 0 === t && 0 === r ? `${e}@${n}` : 0 !== t && 0 === r ? `${e}.${t}@${n}` : 0 === t && 0 !== r ? `${e}:${r}@${n}` : `${e}.${t}:${r}@${n}`;
        }
        this._jid.type;
        var { user: s, server: o } = this._jid;
        return null != s ? `${s}@${o}` : o;
    }

    getUser() {
        return this._jid.user;
    }

    getDevice() {
        return this._jid.device;
    }

    getInnerJid() {
        return this._jid;
    }
    isCompanion() {
        return null != this._jid.device && this._jid.device !== 0;
    }
    isUser() {
        return 's.whatsapp.net' === this._jid.server;
    }
    isBroadcast() {
        return 'broadcast' === this._jid.server;
    }
    getSignalAddress() {
        const e = null != this._jid.agent && 0 !== this._jid.agent ? `_${this._jid.agent}` : '',
            t = null != this._jid.device && 0 !== this._jid.device ? `:${this._jid.device}` : '';
        return [this._jid.user, e, t].join('');
    }
    isOfficialBizAccount() {
        return this.toString() === OFFICIAL_BIZ_WID;
    }
    isGroup() {
        return 'g.us' === this._jid.server;
    }
    isGroupCall() {
        return 'call' === this._jid.server;
    }
    isServer() {
        return 'server' === this._jid.user && 'c.us' === this._jid.server;
    }
    isPSA() {
        return '0' === this._jid.user && 'c.us' === this._jid.server;
    }
    isStatusV3() {
        return 'status' === this._jid.user && 'broadcast' === this._jid.server;
    }
    toJSON() {
        return {
            type: 'wapJid',
            jid: this._jid,
        };
    }

    equals(jid: WapJid) {
        return jid instanceof WapJid && this.getUser() === jid.getUser();
    }

    static parse(data: any) {
        return new WapJid(data.jid);
    }
}

export const G_US = WapJid.create(null, 'g.us');
export const S_WHATSAPP_NET = WapJid.create(null, 's.whatsapp.net');
