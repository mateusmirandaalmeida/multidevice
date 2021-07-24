import { USER_JID_SUFFIX } from "../utils/Utils";

interface WapJidProps {
  type: number;
  user: any;
  device?: any;
  agent?: any;
  server?: any,
}

export class WapJid {
  public static JID = 0;
  public static JID_AD = 1;
  private jid: WapJidProps;

  constructor(jid: WapJidProps) {
    this.jid = jid;
  }

  static createAD(user: string, agent: number, device: number) {
    return new WapJid({
      type: WapJid.JID_AD,
      user,
      device: device ?? 0,
      agent: agent ?? 0,
    });
  }
  
  static create(user: string, server: string) {
    return new WapJid({
      type: WapJid.JID,
      user,
      server,
    });
  }

  toString() {
    if (this.jid.type === WapJid.JID_AD) {
      var { user: e, agent: t, device: r } = this.jid,
        n = USER_JID_SUFFIX;
      return 0 === t && 0 === r
        ? `${e}@${n}`
        : 0 !== t && 0 === r
        ? `${e}.${t}@${n}`
        : 0 === t && 0 !== r
        ? `${e}:${r}@${n}`
        : `${e}.${t}:${r}@${n}`;
    }
    this.jid.type;
    var { user: s, server: o } = this.jid;
    return null != s ? `${s}@${o}` : o;
  }

  getInnerJid() {
    return this.jid;
  }
}

export const G_US = WapJid.create(null, 'g.us');
export const S_WHATSAPP_NET = WapJid.create(null, 's.whatsapp.net');