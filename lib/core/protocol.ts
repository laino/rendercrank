const DEFAULT_BUFFER_SIZE = 1024;
const MAX_INLINE_STRING_LENGTH = 128;

const IS_LITTLE_ENDIAN =
    ((new Uint32Array((new Uint8Array([1,2,3,4])).buffer))[0] === 0x04030201);

export abstract class ProtocolWriter {
    private textEncoder = new TextEncoder();

    protected writeBuffer: ArrayBuffer;
    protected writeView: DataView;
    protected writeOffset: number;

    public constructor(public readonly shared = false) {}

    protected abstract allocate(amount: number, align: number): number;

    public abstract createWriter(): ProtocolWriter;
    public abstract advance();
    public abstract passData(data: ArrayBufferLike);
    public abstract flush(): ArrayBuffer[];

    public writeString(str: string) {
        const encoded = this.textEncoder.encode(str);

        this.writeUInt32(encoded.length);

        if (encoded.length > MAX_INLINE_STRING_LENGTH) {
            this.passData(encoded.buffer);
        } else {
            this.writeUInt8Array(encoded);
        }
    }

    public writeFloat32(num: number) {
        const offset = this.allocate(4, 4);
        this.writeView.setFloat32(offset, num, IS_LITTLE_ENDIAN);
    }

    public writeFloat64(num: number) {
        const offset = this.allocate(8, 8);
        this.writeView.setFloat64(offset, num, IS_LITTLE_ENDIAN);
    }

    public writeInt8(num: number) {
        const offset = this.allocate(1, 1);
        this.writeView.setInt8(offset, num);
    }

    public writeInt16(num: number) {
        const offset = this.allocate(2, 2);
        this.writeView.setInt16(offset, num, IS_LITTLE_ENDIAN);
    }

    public writeInt32(num: number) {
        const offset = this.allocate(4, 4);
        this.writeView.setInt32(offset, num, IS_LITTLE_ENDIAN);
    }

    public writeUInt8(num: number) {
        const offset = this.allocate(1, 1);
        this.writeView.setUint8(offset, num);
    }

    public writeUInt16(num: number) {
        const offset = this.allocate(2, 2);
        this.writeView.setUint16(offset, num, IS_LITTLE_ENDIAN);
    }

    public writeUInt32(num: number) {
        const offset = this.allocate(4, 4);
        this.writeView.setUint32(offset, num, IS_LITTLE_ENDIAN);
    }

    public writeFloat32Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 4, 4);
        new Float32Array(this.writeBuffer).set(arr, offset / 4);
    }

    public writeFloat64Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 8, 8);
        new Float64Array(this.writeBuffer).set(arr, offset / 8);
    }

    public writeInt8Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length, 1);
        new Int8Array(this.writeBuffer).set(arr, offset);
    }

    public writeInt16Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 2, 2);
        new Int16Array(this.writeBuffer).set(arr, offset / 2);
    }

    public writeInt32Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 4, 4);
        new Int32Array(this.writeBuffer).set(arr, offset / 4);
    }

    public writeUInt8Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length, 1);
        new Uint8Array(this.writeBuffer).set(arr, offset);
    }

    public writeUInt16Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 2, 2);
        new Uint16Array(this.writeBuffer).set(arr, offset / 2);
    }

    public writeUInt32Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 4, 4);
        new Uint32Array(this.writeBuffer).set(arr, offset / 4);
    }
}

export abstract class ProtocolReader {
    private textDecoder = new TextDecoder('utf8');

    protected readBuffer: ArrayBuffer;
    protected readView: DataView;
    protected readOffset: number;

    public constructor(public readonly shared = false) {
    }

    protected abstract prepareRead(amount: number, align: number): number;

    public abstract getData(): ArrayBufferLike;
    public abstract advance();

    public readString() {
        const length = this.readUInt32();

        let data: ArrayBuffer;

        if (length > MAX_INLINE_STRING_LENGTH) {
            data = this.getData();
        } else {
            data = this.readUInt8Array(length);
        }

        return this.textDecoder.decode(data);
    }


    public readFloat32() {
        const offset = this.prepareRead(4, 4);
        return this.readView.getFloat32(offset, IS_LITTLE_ENDIAN);
    }

    public readFloat64() {
        const offset = this.prepareRead(8, 8);
        return this.readView.getFloat64(offset, IS_LITTLE_ENDIAN);
    }

    public readInt8() {
        const offset = this.prepareRead(1, 1);
        return this.readView.getInt8(offset);
    }

    public readInt16() {
        const offset = this.prepareRead(2, 2);
        return this.readView.getInt16(offset, IS_LITTLE_ENDIAN);
    }

    public readInt32() {
        const offset = this.prepareRead(4, 4);
        return this.readView.getInt32(offset, IS_LITTLE_ENDIAN);
    }

    public readUInt8() {
        const offset = this.prepareRead(1, 1);
        return this.readView.getUint8(offset);
    }

    public readUInt16() {
        const offset = this.prepareRead(2, 2);
        return this.readView.getUint16(offset, IS_LITTLE_ENDIAN);
    }

    public readUInt32() {
        const offset = this.prepareRead(4, 4);
        return this.readView.getUint32(offset, IS_LITTLE_ENDIAN);
    }

    public readFloat32Array(amount: number) {
        const offset = this.prepareRead(amount * 4, 4);
        return new Float32Array(this.readBuffer, offset, amount);
    }

    public readFloat64Array(amount: number) {
        const offset = this.prepareRead(amount * 8, 8);
        return new Float64Array(this.readBuffer, offset, amount);
    }

    public readInt8Array(amount: number) {
        const offset = this.prepareRead(amount, 1);
        return new Int8Array(this.readBuffer, offset, amount);
    }

    public readInt16Array(amount: number) {
        const offset = this.prepareRead(amount * 2, 2);
        return new Int16Array(this.readBuffer, offset, amount);
    }

    public readInt32Array(amount: number) {
        const offset = this.prepareRead(amount * 4, 4);
        return new Int32Array(this.readBuffer, offset, amount);
    }

    public readUInt8Array(amount: number) {
        const offset = this.prepareRead(amount, 1);
        return new Uint8Array(this.readBuffer, offset, amount);
    }

    public readUInt16Array(amount: number) {
        const offset = this.prepareRead(amount * 2, 2);
        return new Uint16Array(this.readBuffer, offset, amount);
    }

    public readUInt32Array(amount: number) {
        const offset = this.prepareRead(amount * 4, 4);
        return new Uint32Array(this.readBuffer, offset, amount);
    }
}

class ProtocolBufferAllocator {
    private buffers: ArrayBuffer[] = [];
    private bufferIndex = -1;

    public allocate(amount: number) {
        this.bufferIndex++;

        if (this.bufferIndex === this.buffers.length) {
            const buffer = new ArrayBuffer(Math.max(amount, DEFAULT_BUFFER_SIZE));
            this.buffers.push(buffer);
            return buffer;
        }

        let buffer = this.buffers[this.bufferIndex];

        if (buffer.byteLength < amount) {
            this.buffers.push(buffer);

            buffer = new ArrayBuffer(amount);

            this.buffers[this.bufferIndex] = buffer;
        }

        return buffer;
    }

    public return(arr: ArrayBuffer[]) {
        this.buffers.push(...arr);
    }

    public reset() {
        this.buffers = [];
        this.bufferIndex = 0;
    }
}

export class ArrayBufferProtocolWriter extends ProtocolWriter {
    private writeBuffers: ArrayBuffer[] = [];

    protected writeBuffer: ArrayBuffer;
    protected writeView: DataView;
    protected writeOffset = 0;

    public constructor(
            shared = false,
            private allocator: ProtocolBufferAllocator = new ProtocolBufferAllocator(),
    ) {
        super(shared);
    }

    public advance() {
        this.writeBuffer = null;
        this.writeView = null;
        this.writeOffset = 0;
    }

    public passData(data: ArrayBuffer) {
        this.writeBuffers.push(data);
    }

    public createWriter() {
        return new ArrayBufferProtocolWriter(this.shared, this.allocator);
    }

    protected allocate(amount: number, align: number): number {
        if (!this.writeBuffer) {
            this.writeBuffer = this.allocator.allocate(amount);
            this.writeView = new DataView(this.writeBuffer);
            this.writeBuffers.push(this.writeBuffer);
            this.writeOffset = amount;
            return 0;
        }

        let offset = this.writeOffset;

        if (align > 1) {
            offset += align - offset % align;
        }

        const newOffset = offset + amount;

        if (newOffset > this.writeBuffer.byteLength) {
            this.advance();
            return this.allocate(amount, align);
        }

        this.writeOffset = newOffset;

        return offset;
    }

    public flush() {
        const oldBuffers = this.writeBuffers;

        this.writeBuffer = null;
        this.writeView = null;
        this.writeOffset = 0;
        this.writeBuffers = [];

        return oldBuffers;
    }
}

export class ArrayBufferProtocolReader extends ProtocolReader {
    private readBuffers: ArrayBuffer[] = [];
    private readBufferIndex = 0;

    protected readBuffer: ArrayBuffer;
    protected readView: DataView;
    protected readOffset = 0;

    public getData() {
        return this.readBuffers[++this.readBufferIndex];
    }

    public advance() {
        this.readBuffer = this.readBuffers[++this.readBufferIndex];
        this.readView = new DataView(this.readBuffer);
        this.readOffset = 0;
    }

    protected prepareRead(amount: number, align: number): number {
        let offset = this.readOffset;

        if (align > 1) {
            offset += align - offset % align;
        }

        const newOffset = offset + amount;

        if (newOffset > this.readBuffer.byteLength) {
            this.advance();
            return this.prepareRead(amount, align);
        }

        this.readOffset = newOffset;

        return offset;
    }

    public receive(buffers: ArrayBuffer[]) {
        const oldBuffers = this.readBuffers;

        this.readBuffers = buffers;
        this.readBufferIndex = 0;

        this.readBuffer = buffers[0];

        this.readView = this.readBuffer ? new DataView(this.readBuffer) : null;
        this.readOffset = 0;

        return oldBuffers;
    }
}
