import { Allocator, SharedAllocator } from './allocator';

const MIN_BUFFER_SIZE = 1024;
const MAX_INLINE_STRING_LENGTH = 128;

const IS_LITTLE_ENDIAN =
    ((new Uint32Array((new Uint8Array([1,2,3,4])).buffer))[0] === 0x04030201);

export abstract class ProtocolWriter {
    private textEncoder = new TextEncoder();

    protected writeBuffer: ArrayBuffer;
    protected writeView: DataView;

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
        for (let i = 0, size = arr.length; i < size; i++) {
            this.writeView.setFloat32(offset + i * 4, arr[i], IS_LITTLE_ENDIAN);
        }
    }

    public writeFloat64Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 8, 8);
        for (let i = 0, size = arr.length; i < size; i++) {
            this.writeView.setFloat64(offset + i * 8, arr[i], IS_LITTLE_ENDIAN);
        }
    }

    public writeInt8Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length, 1);
        for (let i = 0, size = arr.length; i < size; i++) {
            this.writeView.setInt8(offset + i, arr[i]);
        }
    }

    public writeInt16Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 2, 2);
        for (let i = 0, size = arr.length; i < size; i++) {
            this.writeView.setInt16(offset + i * 2, arr[i], IS_LITTLE_ENDIAN);
        }
    }

    public writeInt32Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 4, 4);
        for (let i = 0, size = arr.length; i < size; i++) {
            this.writeView.setInt32(offset + i * 4, arr[i], IS_LITTLE_ENDIAN);
        }
    }

    public writeUInt8Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length, 1);
        for (let i = 0, size = arr.length; i < size; i++) {
            this.writeView.setUint8(offset + i, arr[i]);
        }
    }

    public writeUInt16Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 2, 2);
        for (let i = 0, size = arr.length; i < size; i++) {
            this.writeView.setUint16(offset + i * 2, arr[i], IS_LITTLE_ENDIAN);
        }
    }

    public writeUInt32Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 4, 4);
        for (let i = 0, size = arr.length; i < size; i++) {
            this.writeView.setUint32(offset + i * 4, arr[i], IS_LITTLE_ENDIAN);
        }
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

class ProtocolBufferAllocator extends Allocator<ArrayBuffer> {
    create(size: number) {
        return new ArrayBuffer(Math.max(size, MIN_BUFFER_SIZE));
    }

    discard() {
        // noop
    }

    sizeOf(buffer: ArrayBuffer) {
        return buffer.byteLength;
    }
}

export class ArrayBufferProtocolWriter extends ProtocolWriter {
    private writeBuffers: ArrayBuffer[] = [];
    private sharedAllocator: SharedAllocator<ArrayBuffer>;

    protected writeBuffer: ArrayBuffer;
    protected writeView: DataView;

    public constructor(
        shared = false,
        private allocator: Allocator<ArrayBuffer> = new ProtocolBufferAllocator(),
    ) {
        super(shared);

        this.sharedAllocator = new SharedAllocator(allocator);
    }

    public advance() {
        this.sharedAllocator.advance();
    }

    public passData(data: ArrayBuffer) {
        this.writeBuffers.push(data);
    }

    public createWriter() {
        return new ArrayBufferProtocolWriter(this.shared, this.allocator);
    }

    protected allocate(amount: number, align: number): number {
        const alloc = this.sharedAllocator;

        const offset = alloc.allocate(amount, align);

        if (this.writeBuffer !== alloc.current) {
            this.writeBuffer = alloc.current;
            this.writeView = new DataView(alloc.current);
            this.writeBuffers.push(alloc.current);
        }

        return offset;
    }

    public flush() {
        this.advance();

        const oldBuffers = this.writeBuffers;

        this.writeBuffer = null;
        this.writeView = null;
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
            offset = offset + align - 1 - (offset + align - 1) % align;
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
