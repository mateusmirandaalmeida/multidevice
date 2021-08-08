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

    private jid: WapJidProps;
    private _serialized: string;

    constructor(jid: WapJidProps) {
        this.jid = jid;
    }

    static createAD(user: string, agent: number, device: number) {
        return new WapJid({
            type: WapJid.JID_AD,
            user,
            device: device ?? 0,
            agent: agent ?? 0,
            server: 's.whatsapp.net'
        });
    }

    static create(user: string, server?: string, device?) {
        return new WapJid({
            type: WapJid.JID,
            user,
            server,
            device
        });
    }

    toString() {
        if (this.jid.type === WapJid.JID_AD) {
            var { user: e, agent: t, device: r } = this.jid,
                n = USER_JID_SUFFIX;
            return 0 === t && 0 === r ? `${e}@${n}` : 0 !== t && 0 === r ? `${e}.${t}@${n}` : 0 === t && 0 !== r ? `${e}:${r}@${n}` : `${e}.${t}:${r}@${n}`;
        }
        this.jid.type;
        var { user: s, server: o } = this.jid;
        return null != s ? `${s}@${o}` : o;
    }

    getUser() {
        return this.jid.user;
    }

    getDevice() {
        return this.jid.device;
    }

    getInnerJid() {
        return this.jid;
    }
    isCompanion() {
        return null != this.jid.device && this.jid.device !== 0;
    }
    isUser() {
        return 's.whatsapp.net' === this.jid.server;
    }
    isBroadcast() {
        return 'broadcast' === this.jid.server;
    }
    getSignalAddress() {
        const e = null != this.jid.agent && 0 !== this.jid.agent ? `_${this.jid.agent}` : '',
            t = null != this.jid.device && 0 !== this.jid.device ? `:${this.jid.device}` : '';
        return [this.jid.user, e, t].join('');
    }
    isOfficialBizAccount() {
        return this.toString() === OFFICIAL_BIZ_WID;
    }
    isGroup() {
        return 'g.us' === this.jid.server;
    }
    isGroupCall() {
        return 'call' === this.jid.server;
    }
    isServer() {
        return 'server' === this.jid.user && 'c.us' === this.jid.server;
    }
    isPSA() {
        return '0' === this.jid.user && 'c.us' === this.jid.server;
    }
    isStatusV3() {
        return 'status' === this.jid.user && 'broadcast' === this.jid.server;
    }
    toJSON() {
        return {
            type: 'wapJid',
            jid: this.jid,
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
