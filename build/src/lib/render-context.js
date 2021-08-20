import { BufferRef } from './resources';
var CONTEXT_ID_COUNTER = 0;
export var RenderContextID;
(function (RenderContextID) {
    function nextID() {
        return CONTEXT_ID_COUNTER++;
    }
    RenderContextID.nextID = nextID;
})(RenderContextID || (RenderContextID = {}));
var RenderContext = /** @class */ (function () {
    function RenderContext() {
        this.id = RenderContextID.nextID();
        this.bufferPool = new BufferPool(this);
        this.float32BufferPool = new BufferPoolView(this.bufferPool, Float32Array);
    }
    return RenderContext;
}());
export { RenderContext };
var BUFFER_SIZE = 1024;
var BufferPoolView = /** @class */ (function () {
    function BufferPoolView(pool, type) {
        this.pool = pool;
        this.type = type;
    }
    BufferPoolView.prototype.writeMultiData = function (multi, totalLength) {
        var ELEMENT_SIZE = this.type.BYTES_PER_ELEMENT;
        var byteLength = totalLength * ELEMENT_SIZE;
        var byteOffset = this.pool.allocateSpace(byteLength);
        var buffer = this.pool.currentBuffer;
        if (this.currentBuffer !== buffer) {
            this.currentBuffer = buffer;
            this.currentView = new this.type(buffer.buffer);
        }
        var writeOffset = byteOffset;
        for (var i = 0; i < multi.length; i++) {
            var data = multi[i];
            this.currentView.set(data, writeOffset);
            writeOffset += data.length * ELEMENT_SIZE;
        }
        return {
            buffer: buffer,
            byteOffset: byteOffset,
            byteLength: byteLength
        };
    };
    BufferPoolView.prototype.writeData = function (data) {
        var ELEMENT_SIZE = this.type.BYTES_PER_ELEMENT;
        var byteLength = data.length * ELEMENT_SIZE;
        var byteOffset = this.pool.allocateSpace(byteLength);
        var buffer = this.pool.currentBuffer;
        if (this.currentBuffer !== buffer) {
            this.currentBuffer = buffer;
            this.currentView = new this.type(buffer.buffer);
        }
        this.currentView.set(data, byteOffset);
        return {
            buffer: buffer,
            byteOffset: byteOffset,
            byteLength: byteLength
        };
    };
    return BufferPoolView;
}());
var BufferPool = /** @class */ (function () {
    function BufferPool(context) {
        this.context = context;
        this.buffers = [];
        this.buffersIndex = 0;
        this.currentBufferOffset = 0;
    }
    BufferPool.prototype.reset = function () {
        this.buffersIndex = 0;
        this.currentBufferOffset = 0;
    };
    BufferPool.prototype.allocateSpace = function (amount) {
        if (this.buffersIndex >= this.buffers.length) {
            this.currentBuffer = new BufferRef(new ArrayBuffer(Math.max(BUFFER_SIZE, amount)));
            this.buffers.push(this.currentBuffer);
        }
        var nextOffset = this.currentBufferOffset + amount;
        if (nextOffset > this.currentBuffer.size) {
            if (this.currentBufferOffset === 0) {
                // We didn't use this buffer. Replace it with one that fits.
                this.currentBuffer = new BufferRef(new ArrayBuffer(Math.max(BUFFER_SIZE, amount)));
                this.buffers[this.buffersIndex] = this.currentBuffer;
            }
            else {
                this.buffersIndex++;
                this.currentBufferOffset = 0;
                this.currentBuffer = this.buffers[this.buffersIndex];
                return this.allocateSpace(amount);
            }
        }
        var old = this.currentBufferOffset;
        this.currentBufferOffset = nextOffset;
        return old;
    };
    return BufferPool;
}());
//# sourceMappingURL=render-context.js.map