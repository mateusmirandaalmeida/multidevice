import { WA_CONSTANTS } from "./WaConstants";

const isString = function (e) {
  return "string" == typeof e;
};

const s =
  /(?:^([^.:@]+))(?:\.([0-9]{1,2}))?(?:\:([0-9]{1,2}))?@(s\.whatsapp\.net|c\.us|g\.us|broadcast|call|b\.whatsapp\.net)$/i;
const o = ["name", "short", "notify"];

export class Wid {
  public _serialized;
  public type;
  public user;
  public device;
  public agent;
  public server;

  constructor(e) {
    var r = e.match(s);
    if (!r) throw new Error(`wid error: invalid wid: ${e}`);
    var a,
      i = [],
      n = r[1],
      o = r[2],
      l = r[3],
      d = r[4].toLowerCase();
    switch (d) {
      case "s.whatsapp.net":
        a = "c.us";
        break;
      default:
        a = d;
    }
    if (((this.server = a), (this.user = n), i.push(this.user), o)) {
      if ("c.us" !== this.server)
        throw new Error(
          `wid error: wrong server for wid with agent present: ${e}`
        );
      var u = parseInt(o, 10);
      if (isNaN(u)) throw new Error(`wid error: NaN agent: ${o} wid: ${e}`);
      if (u > 255) throw new Error(`wid error: agent>255 : ${u} wid: ${e}`);
      u && (i.push("."), i.push(u), (this.agent = u));
    }
    if (l) {
      if ("c.us" !== this.server)
        throw new Error(
          `wid error: wrong server for wid with device present: ${e}`
        );
      var c = parseInt(l, 10);
      if (isNaN(c)) throw new Error(`wid error: NaN device: ${l} wid: ${e}`);
      if (c > 255) throw new Error(`wid error: device>255 : ${c} wid: ${e}`);
      c && (i.push(":"), i.push(c), (this.device = c));
    }
    i.push("@"), i.push(this.server), (this._serialized = i.join(""));
  }
  getUserPartForLog() {
    if (this.isGroup()) {
      var e = this.user.split("-");
      if (2 === e.length) {
        var [t, r] = e;
        return `${t.slice(-4)}-${r}`;
      }
    }
    return this.user.slice(-4);
  }

  getUser() {
    return this.user
  }

  toString(e?) {
    if (e) {
      var t,
        r,
        a = e.legacy && "c.us" === this.server ? "s.whatsapp.net" : this.server;
      e.formatFull
        ? ((t = `.${this.agent || 0}`), (r = `:${this.device || 0}`))
        : ((t = null != this.agent && 0 !== this.agent ? `.${this.agent}` : ""),
          (r =
            null != this.device && 0 !== this.device ? `:${this.device}` : ""));
      var i = e.forLog ? this.getUserPartForLog() : this.user;
      if (e.formatFull || (e.legacy && "c.us" === this.server) || e.forLog)
        return [i, t, r, "@", a].join("");
    }
    return this._serialized;
  }
  toLogString() {
    return this.toString({
      forLog: !0,
      legacy: !1,
    });
  }
  toJid() {
    return this.toString({
      legacy: !0,
    });
  }
  getSignalAddress() {
    var e = null != this.agent && 0 !== this.agent ? `_${this.agent}` : "",
      t = null != this.device && 0 !== this.device ? `:${this.device}` : "";
    return [this.user, e, t].join("");
  }
  getDeviceId() {
    var e = this.device;
    return null == e ? 0 : e;
  }
  equals(e) {
    return e instanceof Wid && this.toString() === e.toString();
  }
  isLessThan(e) {
    return e instanceof Wid && this.toString() < e.toString();
  }
  isGreaterThan(e) {
    return e instanceof Wid && this.toString() > e.toString();
  }
  isCompanion() {
    return (
      null != this.device && this.device !== WA_CONSTANTS.DEVICE.PRIMARY_DEVICE
    );
  }
  isUser() {
    return "c.us" === this.server;
  }
  isBroadcast() {
    return "broadcast" === this.server;
  }
  isOfficialBizAccount() {
    return this.toString() === WA_CONSTANTS.OFFICIAL_BIZ_WID;
  }
  isGroup() {
    return "g.us" === this.server;
  }
  isGroupCall() {
    return "call" === this.server;
  }
  isServer() {
    return "server" === this.user && "c.us" === this.server;
  }
  isPSA() {
    return "0" === this.user && "c.us" === this.server;
  }
  isStatusV3() {
    return "status" === this.user && "broadcast" === this.server;
  }
  toJSON() {
    return this.toString();
  }
  static isXWid(e, t) {
    return isString(t)
      ? t.split("@")[1] === e
      : t instanceof Wid
      ? t.server === e
      : void 0 !== t && !1;
  }
  static isUser(e) {
    return Wid.isXWid("c.us", e);
  }
  static isBroadcast(e) {
    return Wid.isXWid("broadcast", e);
  }
  static isGroup(e) {
    return Wid.isXWid("g.us", e);
  }
  static isGroupCall(e) {
    return Wid.isXWid("call", e);
  }
  static isWid(e) { 
    return isString(e) ? s.test(e) : e instanceof Wid;
  }
  static canBeWid(e) {
    return !e || !o.includes(e);
  }
  static isServer(e) {
    return isString(e)
      ? e.toLowerCase() === WA_CONSTANTS.SERVER_WID
      : e instanceof Wid && e.isServer();
  }
  static isPSA(e) {
    return isString(e)
      ? e.toLowerCase() === WA_CONSTANTS.PSA_WID
      : e instanceof Wid && e.isPSA();
  }
  static isStatusV3(e) {
    return isString(e)
      ? e.toLowerCase() === WA_CONSTANTS.STATUS_WID
      : e instanceof Wid && e.isStatusV3();
  }
  static isOfficialBizAccount(e) {
    return isString(e)
      ? e.toLowerCase() === WA_CONSTANTS.OFFICIAL_BIZ_WID
      : e instanceof Wid && e.isOfficialBizAccount();
  }
  static user(e) {
    return isString(e) ? e.split("@")[0] : e instanceof Wid ? e.user : void 0;
  }
  static equals(e, t) {
    return e instanceof Wid || t instanceof Wid
      ? e instanceof Wid && e.equals(t)
      : e === t;
  }
  static isLessThan(e, t) {
    return e instanceof Wid && t instanceof Wid && e.toString() < t.toString();
  }
  static isGreaterThan(e, t) {
    return e instanceof Wid && t instanceof Wid && e.toString() > t.toString();
  }
}
