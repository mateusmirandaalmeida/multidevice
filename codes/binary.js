(e,t,r)=>{
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
        t.numUtf8Bytes = u,
        t.longFitsInDouble = c,
        t.parseInt64OrThrow = j,
        t.parseUint64OrThrow = W,
        t.Binary = void 0;
        var a = r(91579)
          , i = 65533
          , n = new Uint8Array(10)
          , s = new Uint8Array(0);
        class o {
            constructor(e=s, t=!1) {
                e instanceof ArrayBuffer ? (this._buffer = new Uint8Array(e),
                this._readEndIndex = this._writeIndex = e.byteLength) : e instanceof Uint8Array && (this._buffer = e,
                this._readEndIndex = this._writeIndex = e.length),
                this._bytesTrashed = 0,
                this._earliestIndex = this._readIndex = 0,
                this._view = null,
                this._littleEndian = t,
                this._hiddenReads = 0,
                this._hiddenWrites = 0
            }
            size() {
                return this._readEndIndex - this._readIndex
            }
            peek(e, t) {
                this._hiddenReads++;
                var r = this._readIndex
                  , a = this._bytesTrashed;
                try {
                    return e(this, t)
                } finally {
                    this._hiddenReads--,
                    this._readIndex = r - (this._bytesTrashed - a)
                }
            }
            advance(e) {
                this._shiftReadOrThrow(e)
            }
            readWithViewParser(e, t, r, a) {
                return t(this._getView(), this._shiftReadOrThrow(e), e, r, a)
            }
            readWithBytesParser(e, t, r, a) {
                return t(this._buffer, this._shiftReadOrThrow(e), e, r, a)
            }
            readUint8() {
                return p(this, 1, h, !1)
            }
            readInt8() {
                return p(this, 1, h, !0)
            }
            readUint16(e=this._littleEndian) {
                return p(this, 2, _, e)
            }
            readInt32(e=this._littleEndian) {
                return p(this, 4, m, e)
            }
            readUint32(e=this._littleEndian) {
                return p(this, 4, g, e)
            }
            readInt64(e=this._littleEndian) {
                return p(this, 8, v, j, e)
            }
            readUint64(e=this._littleEndian) {
                return p(this, 8, v, W, e)
            }
            readLong(e, t=this._littleEndian) {
                return p(this, 8, v, e, t)
            }
            readFloat32(e=this._littleEndian) {
                return p(this, 4, y, e)
            }
            readFloat64(e=this._littleEndian) {
                return p(this, 8, E, e)
            }
            readVarInt(e) {
                var t = f(this, 0, S, this.size());
                return f(this, t, T, e)
            }
            readBuffer(e=this.size()) {
                return 0 === e ? new ArrayBuffer(0) : f(this, e, A)
            }
            readByteArray(e=this.size()) {
                return 0 === e ? new Uint8Array(0) : f(this, e, b)
            }
            readBinary(e=this.size(), t=this._littleEndian) {
                if (0 === e)
                    return new o(void 0,t);
                var r = f(this, e, b);
                return new o(r,t)
            }
            indexOf(e) {
                if (0 === e.length)
                    return 0;
                for (var t = this._buffer, r = this._readEndIndex, a = this._readIndex, i = 0, n = a, s = a; s < r; s++)
                    if (t[s] === e[i]) {
                        if (0 === i && (n = s),
                        ++i === e.byteLength)
                            return s - a - e.byteLength + 1
                    } else
                        i > 0 && (i = 0,
                        s = n);
                return -1
            }
            readString(e) {
                return f(this, e, C)
            }
            ensureCapacity(e) {
                this._maybeReallocate(this._readIndex + e)
            }
            ensureAdditionalCapacity(e) {
                this._maybeReallocate(this._writeIndex + e)
            }
            writeToView(e, t, r, a) {
                var i = this._shiftWriteMaybeReallocate(e);
                return t(this._getView(), i, e, r, a)
            }
            writeToBytes(e, t, r, a) {
                var i = this._shiftWriteMaybeReallocate(e);
                return t(this._buffer, i, e, r, a)
            }
            write(...e) {
                for (var t = 0; t < e.length; t++) {
                    var r = e[t];
                    "string" == typeof r ? this.writeString(r) : "number" == typeof r ? this.writeUint8(r) : r instanceof o ? this.writeBinary(r) : r instanceof ArrayBuffer ? this.writeBuffer(r) : r instanceof Uint8Array && this.writeByteArray(r)
                }
            }
            writeUint8(e) {
                Y(e, 0, 256, "uint8"),
                O(this, 1, M, e, !1)
            }
            writeInt8(e) {
                Y(e, -128, 128, "signed int8"),
                O(this, 1, M, e, !0)
            }
            writeUint16(e, t=this._littleEndian) {
                Y(e, 0, 65536, "uint16"),
                P(this, 2, w, e, t)
            }
            writeInt16(e, t=this._littleEndian) {
                Y(e, -32768, 32768, "signed int16"),
                P(this, 2, I, e, t)
            }
            writeUint32(e, t=this._littleEndian) {
                Y(e, 0, 4294967296, "uint32"),
                P(this, 4, R, e, t)
            }
            writeInt32(e, t=this._littleEndian) {
                Y(e, -2147483648, 2147483648, "signed int32"),
                P(this, 4, D, e, t)
            }
            writeUint64(e, t=this._littleEndian) {
                Y(e, 0, 0x10000000000000000, "uint64"),
                P(this, 8, N, e, t)
            }
            writeInt64(e, t=this._littleEndian) {
                Y(e, -0x8000000000000000, 0x8000000000000000, "signed int64"),
                P(this, 8, N, e, t)
            }
            writeFloat32(e, t=this._littleEndian) {
                P(this, 4, L, e, t)
            }
            writeFloat64(e, t=this._littleEndian) {
                P(this, 8, k, e, t)
            }
            writeVarInt(e) {
                Y(e, -0x8000000000000000, 0x8000000000000000, "varint (signed int64)");
                var t = e < 0
                  , r = t ? -e : e
                  , a = Math.floor(r / 4294967296)
                  , i = r - 4294967296 * a;
                t && (a = ~a,
                0 === i ? a++ : i = -i),
                O(this, B(a, i), U, a, i)
            }
            writeVarIntFromHexLong(e) {
                for (var t = (0,
                a.hexLongIsNegative)(e), r = t ? (0,
                a.negateHexLong)(e) : e, i = (0,
                a.hexLongToHex)(r), n = 0, s = 0, o = 0; o < a.NUM_HEX_IN_LONG; o++)
                    n = n << 4 | s >>> 28,
                    s = s << 4 | (0,
                    a.hexAt)(i, o);
                t && (n = ~n,
                0 === s ? n++ : s = -s),
                O(this, B(n, s), U, n, s)
            }
            writeBinary(e) {
                var t = e.peek((e=>e.readByteArray()));
                if (t.length) {
                    var r = this._shiftWriteMaybeReallocate(t.length);
                    this._buffer.set(t, r)
                }
            }
            writeBuffer(e) {
                this.writeByteArray(new Uint8Array(e))
            }
            writeByteArray(e) {
                var t = this._shiftWriteMaybeReallocate(e.length);
                this._buffer.set(e, t)
            }
            writeBufferView(e) {
                this.writeByteArray(new Uint8Array(e.buffer,e.byteOffset,e.byteLength))
            }
            writeString(e) {
                O(this, u(e), G, e)
            }
            writeHexLong(e, t=this._littleEndian) {
                P(this, 8, F, e, t)
            }
            writeBytes(...e) {
                for (var t = 0; t < e.length; t++)
                    Y(e[t], 0, 256, "byte");
                O(this, e.length, x, e)
            }
            writeAtomically(e, t) {
                this._hiddenWrites++;
                var r = this._writeIndex
                  , a = this._bytesTrashed;
                try {
                    var i = e(this, t);
                    return r = this._writeIndex,
                    a = this._bytesTrashed,
                    i
                } finally {
                    this._hiddenWrites--,
                    this._writeIndex = r - (this._bytesTrashed - a)
                }
            }
            writeWithVarIntLength(e, t) {
                var r = this._writeIndex
                  , a = this.writeAtomically(e, t)
                  , i = this._writeIndex;
                this.writeVarInt(i - r);
                for (var s = this._writeIndex - i, o = this._buffer, l = 0; l < s; l++)
                    n[l] = o[i + l];
                for (var d = i - 1; d >= r; d--)
                    o[d + s] = o[d];
                for (var u = 0; u < s; u++)
                    o[r + u] = n[u];
                return a
            }
            static build(...e) {
                for (var t = 0, r = 0; r < e.length; r++) {
                    var a = e[r];
                    "string" == typeof a ? t += u(a) : "number" == typeof a ? t++ : a instanceof o ? t += a.size() : a instanceof ArrayBuffer ? t += a.byteLength : a instanceof Uint8Array && (t += a.length)
                }
                var i = new o;
                return i.ensureCapacity(t),
                i.write.apply(i, arguments),
                i
            }
            _getView() {
                return this._view || (this._view = new DataView(this._buffer.buffer,this._buffer.byteOffset))
            }
            _shiftReadOrThrow(e) {
                if (e < 0)
                    throw new Error("ReadError: given negative number of bytes to read");
                var t = this._readIndex
                  , r = t + e;
                if (r > this._readEndIndex)
                    throw new Error(t === this._readEndIndex ? "ReadError: tried to read from depleted binary" : "ReadError: tried to read beyond end of binary");
                return this._readIndex = r,
                this._hiddenReads || (this._earliestIndex = r),
                t
            }
            _maybeReallocate(e) {
                var t = this._buffer;
                if (e <= t.length)
                    return e;
                var r = this._earliestIndex
                  , a = e - r
                  , i = Math.max(a, 2 * (t.length - r), 64)
                  , n = new Uint8Array(i);
                return r ? (n.set(t.subarray(r)),
                this._bytesTrashed += r,
                this._readIndex -= r,
                this._readEndIndex -= r,
                this._writeIndex -= r,
                this._earliestIndex = 0) : n.set(t),
                this._buffer = n,
                this._view = null,
                a
            }
            _shiftWriteMaybeReallocate(e) {
                var t = this._maybeReallocate(this._writeIndex + e)
                  , r = this._writeIndex;
                return this._writeIndex = t,
                this._hiddenWrites || (this._readEndIndex = t),
                r
            }
        }
        t.Binary = o;
        var l = ""
          , d = 0;
        function u(e) {
            if (e === l)
                return d;
            for (var t = e.length, r = 0, a = 0; a < t; a++) {
                var i = e.charCodeAt(a);
                if (i < 128)
                    r++;
                else if (i < 2048)
                    r += 2;
                else if (i < 55296 || 57344 <= i && i <= 65535)
                    r += 3;
                else if (55296 <= i && i < 56320 && a + 1 !== t) {
                    var n = e.charCodeAt(a + 1);
                    56320 <= n && n < 57344 ? (a++,
                    r += 4) : r += 3
                } else
                    r += 3
            }
            return l = e,
            d = r
        }
        function c(e, t, r) {
            var a = t >> 21;
            if (e) {
                var i = Boolean(2097151 & t || r);
                return 0 === a || -1 === a && i
            }
            return 0 === a
        }
        function p(e, t, r, a, i) {
            return e.readWithViewParser(t, r, a, i)
        }
        function f(e, t, r, a, i) {
            return e.readWithBytesParser(t, r, a, i)
        }
        function h(e, t, r, a) {
            return a ? e.getInt8(t) : e.getUint8(t)
        }
        function _(e, t, r, a) {
            return e.getUint16(t, a)
        }
        function m(e, t, r, a) {
            return e.getInt32(t, a)
        }
        function g(e, t, r, a) {
            return e.getUint32(t, a)
        }
        function v(e, t, r, a, i) {
            return a(e.getInt32(i ? t + 4 : t, i), e.getInt32(i ? t : t + 4, i))
        }
        function y(e, t, r, a) {
            return e.getFloat32(t, a)
        }
        function E(e, t, r, a) {
            return e.getFloat64(t, a)
        }
        function S(e, t, r, a) {
            for (var i = Math.min(a, 10), n = 0, s = 128; n < i && 128 & s; )
                s = e[t + n++];
            if (10 === n && s > 1)
                throw new Error("ParseError: varint exceeds 64 bits");
            return 128 & s ? n + 1 : n
        }
        function T(e, t, r, a) {
            var i = 0
              , n = 0
              , s = r;
            10 === r && (n = 1 & e[t + --s]);
            for (var o = s - 1; o >= 0; o--)
                i = i << 7 | n >>> 25,
                n = n << 7 | 127 & e[t + o];
            return a(i, n)
        }
        function A(e, t, r) {
            var a = t + e.byteOffset
              , i = e.buffer;
            return 0 === a && r === i.byteLength ? i : i.slice(a, a + r)
        }
        function b(e, t, r) {
            return e.subarray(t, t + r)
        }
        function C(e, t, r) {
            for (var a = t + r, n = [], s = null, o = t; o < a; o++) {
                n.length > 5e3 && (s || (s = []),
                s.push(String.fromCharCode.apply(String, n)),
                n = []);
                var l = 0 | e[o];
                if (0 == (128 & l))
                    n.push(l);
                else if (192 == (224 & l)) {
                    var d = H(e, o + 1, a);
                    if (d) {
                        o++;
                        var u = (31 & l) << 6 | 63 & d;
                        u >= 128 ? n.push(u) : n.push(i)
                    } else
                        n.push(i)
                } else if (224 == (240 & l)) {
                    var c = H(e, o + 1, a)
                      , p = H(e, o + 2, a);
                    if (c && p) {
                        o += 2;
                        var f = (15 & l) << 12 | (63 & c) << 6 | 63 & p;
                        f >= 2048 && !(55296 <= f && f < 57344) ? n.push(f) : n.push(i)
                    } else
                        c ? (o++,
                        n.push(i)) : n.push(i)
                } else if (240 == (248 & l)) {
                    var h = H(e, o + 1, a)
                      , _ = H(e, o + 2, a)
                      , m = H(e, o + 3, a);
                    if (h && _ && m) {
                        o += 3;
                        var g = (7 & l) << 18 | (63 & h) << 12 | (63 & _) << 6 | 63 & m;
                        if (g >= 65536 && g <= 1114111) {
                            var v = g - 65536;
                            n.push(55296 | v >> 10, 56320 | 1023 & v)
                        } else
                            n.push(i)
                    } else
                        h && _ ? (o += 2,
                        n.push(i)) : h ? (o++,
                        n.push(i)) : n.push(i)
                } else
                    n.push(i)
            }
            var y = String.fromCharCode.apply(String, n);
            return s ? (s.push(y),
            s.join("")) : y
        }
        function P(e, t, r, a, i) {
            return e.writeToView(t, r, a, i)
        }
        function O(e, t, r, a, i) {
            return e.writeToBytes(t, r, a, i)
        }
        function M(e, t, r, a) {
            e[t] = a
        }
        function w(e, t, r, a, i) {
            e.setUint16(t, a, i)
        }
        function I(e, t, r, a, i) {
            e.setInt16(t, a, i)
        }
        function R(e, t, r, a, i) {
            e.setUint32(t, a, i)
        }
        function D(e, t, r, a, i) {
            e.setInt32(t, a, i)
        }
        function N(e, t, r, a, i) {
            var n = a < 0
              , s = n ? -a : a
              , o = Math.floor(s / 4294967296)
              , l = s - 4294967296 * o;
            n && (o = ~o,
            0 === l ? o++ : l = -l),
            e.setUint32(i ? t + 4 : t, o, i),
            e.setUint32(i ? t : t + 4, l, i)
        }
        function L(e, t, r, a, i) {
            e.setFloat32(t, a, i)
        }
        function k(e, t, r, a, i) {
            e.setFloat64(t, a, i)
        }
        function U(e, t, r, a, i) {
            for (var n = a, s = i, o = t + r - 1, l = t; l < o; l++)
                e[l] = 128 | 127 & s,
                s = n << 25 | s >>> 7,
                n >>>= 7;
            e[o] = s
        }
        function G(e, t, r, a) {
            for (var i = t, n = a.length, s = 0; s < n; s++) {
                var o = a.charCodeAt(s);
                if (o < 128)
                    e[i++] = o;
                else if (o < 2048)
                    e[i++] = 192 | o >> 6,
                    e[i++] = 128 | 63 & o;
                else if (o < 55296 || 57344 <= o)
                    e[i++] = 224 | o >> 12,
                    e[i++] = 128 | o >> 6 & 63,
                    e[i++] = 128 | 63 & o;
                else if (55296 <= o && o < 56320 && s + 1 !== n) {
                    var l = a.charCodeAt(s + 1);
                    if (56320 <= l && l < 57344) {
                        s++;
                        var d = 65536 + ((1023 & o) << 10 | 1023 & l);
                        e[i++] = 240 | d >> 18,
                        e[i++] = 128 | d >> 12 & 63,
                        e[i++] = 128 | d >> 6 & 63,
                        e[i++] = 128 | 63 & d
                    } else
                        e[i++] = 239,
                        e[i++] = 191,
                        e[i++] = 189
                } else
                    e[i++] = 239,
                    e[i++] = 191,
                    e[i++] = 189
            }
        }
        function F(e, t, r, i, n) {
            for (var s = (0,
            a.hexLongIsNegative)(i), o = (0,
            a.hexLongToHex)(i), l = 0, d = 0, u = 0; u < 16; u++)
                l = l << 4 | d >>> 28,
                d = d << 4 | (0,
                a.hexAt)(o, u);
            s && (l = ~l,
            0 === d ? l++ : d = -d),
            e.setUint32(n ? t + 4 : t, l, n),
            e.setUint32(n ? t : t + 4, d, n)
        }
        function x(e, t, r, a) {
            for (var i = 0; i < r; i++)
                e[t + i] = a[i]
        }
        function B(e, t) {
            var r, a;
            for (e ? (r = 5,
            a = e >>> 3) : (r = 1,
            a = t >>> 7); a; )
                r++,
                a >>>= 7;
            return r
        }
        function Y(e, t, r, a) {
            if ("number" != typeof e || e != e || Math.floor(e) !== e || e < t || e >= r)
                throw new TypeError("string" == typeof e ? `WriteError: string "${e}" is not a valid ${a}` : `WriteError: ${String(e)} is not a valid ${a}`)
        }
        function K(e, t, r) {
            var a = 4294967296 * (t >= 0 || e ? t : 4294967296 + t) + (r >= 0 ? r : 4294967296 + r);
            if (!c(e, t, r))
                throw new Error(`ReadError: integer exceeded 53 bits (${a})`);
            return a
        }
        function j(e, t) {
            return K(!0, e, t)
        }
        function W(e, t) {
            return K(!1, e, t)
        }
        function H(e, t, r) {
            if (t >= r)
                return 0;
            var a = 0 | e[t];
            return 128 == (192 & a) ? a : 0
        }
    }