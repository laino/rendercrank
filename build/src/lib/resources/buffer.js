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
import { Resource, ResourceRef } from '../core';
var BufferRef = /** @class */ (function (_super) {
    __extends(BufferRef, _super);
    function BufferRef(buffer) {
        var _this = _super.call(this, Buffer) || this;
        _this.buffer = buffer;
        _this.updates = [];
        _this.isShared = false;
        if (window.SharedArrayBuffer) {
            _this.isShared = buffer instanceof SharedArrayBuffer;
        }
        _this.byteView = new Uint8Array(buffer);
        _this.size = buffer.byteLength;
        return _this;
    }
    BufferRef.prototype.notify = function (offset, length) {
        this.updates.push({
            offset: offset,
            length: length
        });
        this.needsUpdate = true;
    };
    BufferRef.prototype.writeData = function (protocol) {
        if (this.isShared || protocol.shared) {
            protocol.writeUInt8(1);
            protocol.passData(this.buffer);
        }
        else {
            protocol.writeUInt8(0);
            protocol.writeUInt32(this.buffer.byteLength);
            protocol.writeUInt8Array(this.byteView);
        }
    };
    BufferRef.prototype.writeUpdate = function (protocol) {
        var updates = this.updates;
        protocol.writeUInt32(updates.length);
        for (var i = 0; i < updates.length; i++) {
            var _a = updates[i], offset = _a.offset, length_1 = _a.length;
            protocol.writeUInt32(offset);
            protocol.writeUInt32(length_1);
            if (this.isShared || protocol.shared) {
                protocol.writeUInt8Array(this.byteView.subarray(offset, offset + length_1));
            }
        }
        this.updates = [];
    };
    BufferRef.prototype.onUnload = function () {
        this.needsUpdate = false;
        this.updates = [];
    };
    return BufferRef;
}(ResourceRef));
export { BufferRef };
var Buffer = /** @class */ (function (_super) {
    __extends(Buffer, _super);
    function Buffer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Buffer.prototype.load = function (protocol) {
        var data;
        var isShared = !!protocol.readUInt8();
        if (isShared) {
            this.sharedBuffer = data = new Uint8Array(protocol.getData());
        }
        else {
            var length_2 = protocol.readUInt32();
            data = protocol.readUInt8Array(length_2);
        }
        var gl = this.renderer.gl;
        var buffer = this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };
    Buffer.prototype.update = function (protocol) {
        var gl = this.renderer.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        var updateNumber = protocol.readUInt32();
        for (var i = 0; i < updateNumber; i++) {
            var offset = protocol.readUInt32();
            var length_3 = protocol.readUInt32();
            if (this.sharedBuffer) {
                gl.bufferSubData(gl.ARRAY_BUFFER, offset, protocol.readUInt8Array(length_3));
            }
            else {
                gl.bufferSubData(gl.ARRAY_BUFFER, offset, this.sharedBuffer, offset, length_3);
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };
    Buffer.prototype.unload = function () {
        var gl = this.renderer.gl;
        gl.deleteBuffer(this.buffer);
        this.buffer = null;
    };
    Buffer.resourceName = 'Buffer';
    return Buffer;
}(Resource));
export { Buffer };
//# sourceMappingURL=buffer.js.map