var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var DEFAULT_BUFFER_SIZE = 1024;
var MAX_INLINE_STRING_LENGTH = 128;
var IS_LITTLE_ENDIAN = ((new Uint32Array((new Uint8Array([1, 2, 3, 4])).buffer))[0] === 0x04030201);
var ProtocolWriter = /** @class */ (function () {
    function ProtocolWriter(shared) {
        if (shared === void 0) { shared = false; }
        this.shared = shared;
        this.textEncoder = new TextEncoder();
    }
    ProtocolWriter.prototype.writeString = function (str) {
        var encoded = this.textEncoder.encode(str);
        this.writeUInt32(encoded.length);
        if (encoded.length > MAX_INLINE_STRING_LENGTH) {
            this.passData(encoded.buffer);
        }
        else {
            this.writeUInt8Array(encoded);
        }
    };
    ProtocolWriter.prototype.writeFloat32 = function (num) {
        var offset = this.allocate(4, 4);
        this.writeView.setFloat32(offset, num, IS_LITTLE_ENDIAN);
    };
    ProtocolWriter.prototype.writeFloat64 = function (num) {
        var offset = this.allocate(8, 8);
        this.writeView.setFloat64(offset, num, IS_LITTLE_ENDIAN);
    };
    ProtocolWriter.prototype.writeInt8 = function (num) {
        var offset = this.allocate(1, 1);
        this.writeView.setInt8(offset, num);
    };
    ProtocolWriter.prototype.writeInt16 = function (num) {
        var offset = this.allocate(2, 2);
        this.writeView.setInt16(offset, num, IS_LITTLE_ENDIAN);
    };
    ProtocolWriter.prototype.writeInt32 = function (num) {
        var offset = this.allocate(4, 4);
        this.writeView.setInt32(offset, num, IS_LITTLE_ENDIAN);
    };
    ProtocolWriter.prototype.writeUInt8 = function (num) {
        var offset = this.allocate(1, 1);
        this.writeView.setUint8(offset, num);
    };
    ProtocolWriter.prototype.writeUInt16 = function (num) {
        var offset = this.allocate(2, 2);
        this.writeView.setUint16(offset, num, IS_LITTLE_ENDIAN);
    };
    ProtocolWriter.prototype.writeUInt32 = function (num) {
        var offset = this.allocate(4, 4);
        this.writeView.setUint32(offset, num, IS_LITTLE_ENDIAN);
    };
    ProtocolWriter.prototype.writeFloat32Array = function (arr) {
        var offset = this.allocate(arr.length * 4, 4);
        for (var i = 0, size = arr.length; i < size; i++) {
            this.writeView.setFloat32(offset + i * 4, arr[i], IS_LITTLE_ENDIAN);
        }
    };
    ProtocolWriter.prototype.writeFloat64Array = function (arr) {
        var offset = this.allocate(arr.length * 8, 8);
        for (var i = 0, size = arr.length; i < size; i++) {
            this.writeView.setFloat64(offset + i * 8, arr[i], IS_LITTLE_ENDIAN);
        }
    };
    ProtocolWriter.prototype.writeInt8Array = function (arr) {
        var offset = this.allocate(arr.length, 1);
        for (var i = 0, size = arr.length; i < size; i++) {
            this.writeView.setInt8(offset + i, arr[i]);
        }
    };
    ProtocolWriter.prototype.writeInt16Array = function (arr) {
        var offset = this.allocate(arr.length * 2, 2);
        for (var i = 0, size = arr.length; i < size; i++) {
            this.writeView.setInt16(offset + i * 2, arr[i], IS_LITTLE_ENDIAN);
        }
    };
    ProtocolWriter.prototype.writeInt32Array = function (arr) {
        var offset = this.allocate(arr.length * 4, 4);
        for (var i = 0, size = arr.length; i < size; i++) {
            this.writeView.setInt32(offset + i * 4, arr[i], IS_LITTLE_ENDIAN);
        }
    };
    ProtocolWriter.prototype.writeUInt8Array = function (arr) {
        var offset = this.allocate(arr.length, 1);
        for (var i = 0, size = arr.length; i < size; i++) {
            this.writeView.setUint8(offset + i, arr[i]);
        }
    };
    ProtocolWriter.prototype.writeUInt16Array = function (arr) {
        var offset = this.allocate(arr.length * 2, 2);
        for (var i = 0, size = arr.length; i < size; i++) {
            this.writeView.setUint16(offset + i * 2, arr[i], IS_LITTLE_ENDIAN);
        }
    };
    ProtocolWriter.prototype.writeUInt32Array = function (arr) {
        var offset = this.allocate(arr.length * 4, 4);
        for (var i = 0, size = arr.length; i < size; i++) {
            this.writeView.setUint32(offset + i * 4, arr[i], IS_LITTLE_ENDIAN);
        }
    };
    return ProtocolWriter;
}());
export { ProtocolWriter };
var ProtocolReader = /** @class */ (function () {
    function ProtocolReader(shared) {
        if (shared === void 0) { shared = false; }
        this.shared = shared;
        this.textDecoder = new TextDecoder('utf8');
    }
    ProtocolReader.prototype.readString = function () {
        var length = this.readUInt32();
        var data;
        if (length > MAX_INLINE_STRING_LENGTH) {
            data = this.getData();
        }
        else {
            data = this.readUInt8Array(length);
        }
        return this.textDecoder.decode(data);
    };
    ProtocolReader.prototype.readFloat32 = function () {
        var offset = this.prepareRead(4, 4);
        return this.readView.getFloat32(offset, IS_LITTLE_ENDIAN);
    };
    ProtocolReader.prototype.readFloat64 = function () {
        var offset = this.prepareRead(8, 8);
        return this.readView.getFloat64(offset, IS_LITTLE_ENDIAN);
    };
    ProtocolReader.prototype.readInt8 = function () {
        var offset = this.prepareRead(1, 1);
        return this.readView.getInt8(offset);
    };
    ProtocolReader.prototype.readInt16 = function () {
        var offset = this.prepareRead(2, 2);
        return this.readView.getInt16(offset, IS_LITTLE_ENDIAN);
    };
    ProtocolReader.prototype.readInt32 = function () {
        var offset = this.prepareRead(4, 4);
        return this.readView.getInt32(offset, IS_LITTLE_ENDIAN);
    };
    ProtocolReader.prototype.readUInt8 = function () {
        var offset = this.prepareRead(1, 1);
        return this.readView.getUint8(offset);
    };
    ProtocolReader.prototype.readUInt16 = function () {
        var offset = this.prepareRead(2, 2);
        return this.readView.getUint16(offset, IS_LITTLE_ENDIAN);
    };
    ProtocolReader.prototype.readUInt32 = function () {
        var offset = this.prepareRead(4, 4);
        return this.readView.getUint32(offset, IS_LITTLE_ENDIAN);
    };
    ProtocolReader.prototype.readFloat32Array = function (amount) {
        var offset = this.prepareRead(amount * 4, 4);
        return new Float32Array(this.readBuffer, offset, amount);
    };
    ProtocolReader.prototype.readFloat64Array = function (amount) {
        var offset = this.prepareRead(amount * 8, 8);
        return new Float64Array(this.readBuffer, offset, amount);
    };
    ProtocolReader.prototype.readInt8Array = function (amount) {
        var offset = this.prepareRead(amount, 1);
        return new Int8Array(this.readBuffer, offset, amount);
    };
    ProtocolReader.prototype.readInt16Array = function (amount) {
        var offset = this.prepareRead(amount * 2, 2);
        return new Int16Array(this.readBuffer, offset, amount);
    };
    ProtocolReader.prototype.readInt32Array = function (amount) {
        var offset = this.prepareRead(amount * 4, 4);
        return new Int32Array(this.readBuffer, offset, amount);
    };
    ProtocolReader.prototype.readUInt8Array = function (amount) {
        var offset = this.prepareRead(amount, 1);
        return new Uint8Array(this.readBuffer, offset, amount);
    };
    ProtocolReader.prototype.readUInt16Array = function (amount) {
        var offset = this.prepareRead(amount * 2, 2);
        return new Uint16Array(this.readBuffer, offset, amount);
    };
    ProtocolReader.prototype.readUInt32Array = function (amount) {
        var offset = this.prepareRead(amount * 4, 4);
        return new Uint32Array(this.readBuffer, offset, amount);
    };
    return ProtocolReader;
}());
export { ProtocolReader };
var ProtocolBufferAllocator = /** @class */ (function () {
    function ProtocolBufferAllocator() {
        this.buffers = [];
        this.bufferIndex = -1;
    }
    ProtocolBufferAllocator.prototype.allocate = function (amount) {
        this.bufferIndex++;
        if (this.bufferIndex === this.buffers.length) {
            var buffer_1 = new ArrayBuffer(Math.max(amount, DEFAULT_BUFFER_SIZE));
            this.buffers.push(buffer_1);
            return buffer_1;
        }
        var buffer = this.buffers[this.bufferIndex];
        if (buffer.byteLength < amount) {
            this.buffers.push(buffer);
            buffer = new ArrayBuffer(amount);
            this.buffers[this.bufferIndex] = buffer;
        }
        return buffer;
    };
    ProtocolBufferAllocator.prototype.return = function (arr) {
        var _a;
        (_a = this.buffers).push.apply(_a, __spreadArray([], __read(arr)));
    };
    ProtocolBufferAllocator.prototype.reset = function () {
        this.buffers = [];
        this.bufferIndex = 0;
    };
    return ProtocolBufferAllocator;
}());
var ArrayBufferProtocolWriter = /** @class */ (function (_super) {
    __extends(ArrayBufferProtocolWriter, _super);
    function ArrayBufferProtocolWriter(shared, allocator) {
        if (shared === void 0) { shared = false; }
        if (allocator === void 0) { allocator = new ProtocolBufferAllocator(); }
        var _this = _super.call(this, shared) || this;
        _this.allocator = allocator;
        _this.writeBuffers = [];
        _this.writeOffset = 0;
        return _this;
    }
    ArrayBufferProtocolWriter.prototype.advance = function () {
        this.writeBuffer = null;
        this.writeView = null;
        this.writeOffset = 0;
    };
    ArrayBufferProtocolWriter.prototype.passData = function (data) {
        this.writeBuffers.push(data);
    };
    ArrayBufferProtocolWriter.prototype.createWriter = function () {
        return new ArrayBufferProtocolWriter(this.shared, this.allocator);
    };
    ArrayBufferProtocolWriter.prototype.allocate = function (amount, align) {
        if (!this.writeBuffer) {
            this.writeBuffer = this.allocator.allocate(amount);
            this.writeView = new DataView(this.writeBuffer);
            this.writeBuffers.push(this.writeBuffer);
            this.writeOffset = amount;
            return 0;
        }
        var offset = this.writeOffset;
        if (align > 1) {
            offset += align - offset % align;
        }
        var newOffset = offset + amount;
        if (newOffset > this.writeBuffer.byteLength) {
            this.advance();
            return this.allocate(amount, align);
        }
        this.writeOffset = newOffset;
        return offset;
    };
    ArrayBufferProtocolWriter.prototype.flush = function () {
        var oldBuffers = this.writeBuffers;
        this.writeBuffer = null;
        this.writeView = null;
        this.writeOffset = 0;
        this.writeBuffers = [];
        return oldBuffers;
    };
    return ArrayBufferProtocolWriter;
}(ProtocolWriter));
export { ArrayBufferProtocolWriter };
var ArrayBufferProtocolReader = /** @class */ (function (_super) {
    __extends(ArrayBufferProtocolReader, _super);
    function ArrayBufferProtocolReader() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.readBuffers = [];
        _this.readBufferIndex = 0;
        _this.readOffset = 0;
        return _this;
    }
    ArrayBufferProtocolReader.prototype.getData = function () {
        return this.readBuffers[++this.readBufferIndex];
    };
    ArrayBufferProtocolReader.prototype.advance = function () {
        this.readBuffer = this.readBuffers[++this.readBufferIndex];
        this.readView = new DataView(this.readBuffer);
        this.readOffset = 0;
    };
    ArrayBufferProtocolReader.prototype.prepareRead = function (amount, align) {
        var offset = this.readOffset;
        if (align > 1) {
            offset += align - offset % align;
        }
        var newOffset = offset + amount;
        if (newOffset > this.readBuffer.byteLength) {
            this.advance();
            return this.prepareRead(amount, align);
        }
        this.readOffset = newOffset;
        return offset;
    };
    ArrayBufferProtocolReader.prototype.receive = function (buffers) {
        var oldBuffers = this.readBuffers;
        this.readBuffers = buffers;
        this.readBufferIndex = 0;
        this.readBuffer = buffers[0];
        this.readView = this.readBuffer ? new DataView(this.readBuffer) : null;
        this.readOffset = 0;
        return oldBuffers;
    };
    return ArrayBufferProtocolReader;
}(ProtocolReader));
export { ArrayBufferProtocolReader };
//# sourceMappingURL=protocol.js.map