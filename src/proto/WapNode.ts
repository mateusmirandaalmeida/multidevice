import { Binary } from './../proto/Binary';

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

    contentBytes() {
        return this.content;
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

    // attrsToString(e) {
    //     for (var t = Object.keys(e), r = '', a = 0; a < t.length; a++) {
    //         var i = t[a];
    //         r += ` ${i}="${e[i].toString()}"`;
    //     }
    //     return r;
    // }

    // uint8ArrayToDebugString(e) {
    //     return 0 === e.length ? '\x3c!-- empty binary --\x3e' : e.length < 50 ? bytesToDebugString(e) : `\x3c!-- ${e.length} bytes --\x3e`;
    // }

    // bytesToDebugString = function (e) {
    //     var t = !0,
    //         r = e.length;
    //     for (; t && r; ) {
    //         var a = e[--r];
    //         t = 32 <= a && a < 127;
    //     }
    //     return t ? JSON.stringify(String.fromCharCode.apply(String, e)) : i(e);
    // };

    // toString() {
    //     var e = '<' + this.tag;
    //     e += this.attrsToString(this.attrs);
    //     var t = this.content;
    //     return Array.isArray(t) ? (e += `>${t.map(String).join('')}</${this.tag}>`) : (e += t ? `>${this.uint8ArrayToDebugString(t)}</${this.tag}>` : ' />'), e;
    // }
}
