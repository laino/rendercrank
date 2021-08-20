
const DEFAULT_BUFFER_SIZE = 1024;
const MAX_INLINE_STRING_LENGTH = 128;

// Abstracted out to make implementing SharedArrayBuffer easy
export abstract class Protocol {
    private textEncoder = new TextEncoder();
    private textDecoder = new TextDecoder('utf8');

    protected writeBuffer: ArrayBuffer;
    protected writeView: DataView;
    protected writeOffset: number;
    protected abstract allocate(needSpace: number): number;

    protected readBuffer: ArrayBuffer;
    protected readView: DataView;
    protected readOffset: number;
    protected abstract prepareRead(amount: number): number;

    public abstract passData(data: ArrayBufferLike);
    public abstract getData(): ArrayBufferLike;

    public writeString(str: string) {
        const encoded = this.textEncoder.encode(str);

        this.writeUInt32(encoded.length);

        if (encoded.length > MAX_INLINE_STRING_LENGTH) {
            this.passData(encoded.buffer);
        } else {
            this.writeUInt8Array(encoded);
        }
    }

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

    public writeFloat32(num: number) {
        this.writeView.setFloat32(this.allocate(4), num);
    }

    public writeFloat64(num: number) {
        this.writeView.setFloat64(this.allocate(8), num);
    }

    public writeInt8(num: number) {
        this.writeView.setInt8(this.allocate(1), num);
    }

    public writeInt16(num: number) {
        this.writeView.setInt16(this.allocate(2), num);
    }

    public writeInt32(num: number) {
        this.writeView.setInt32(this.allocate(4), num);
    }

    public writeUInt8(num: number) {
        this.writeView.setUint8(this.allocate(1), num);
    }

    public writeUInt16(num: number) {
        this.writeView.setUint16(this.allocate(2), num);
    }

    public writeUInt32(num: number) {
        this.writeView.setUint32(this.allocate(4), num);
    }

    public writeFloat32Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 4);
        const writeView = this.writeView;
        for (let i = 0, size = arr.length; i < size; i++) {
            writeView.setFloat32(offset + i, arr[i]);
        }
    }

    public writeFloat64Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 8);
        const writeView = this.writeView;
        for (let i = 0, size = arr.length; i < size; i++) {
            writeView.setFloat64(offset + i, arr[i]);
        }
    }

    public writeInt8Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length);
        const writeView = this.writeView;
        for (let i = 0, size = arr.length; i < size; i++) {
            writeView.setInt8(offset + i, arr[i]);
        }
    }

    public writeInt16Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 2);
        const writeView = this.writeView;
        for (let i = 0, size = arr.length; i < size; i++) {
            writeView.setInt16(offset + i, arr[i]);
        }
    }

    public writeInt32Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 4);
        const writeView = this.writeView;
        for (let i = 0, size = arr.length; i < size; i++) {
            writeView.setInt32(offset + i, arr[i]);
        }
    }

    public writeUInt8Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length);
        const writeView = this.writeView;
        for (let i = 0, size = arr.length; i < size; i++) {
            writeView.setUint8(offset + i, arr[i]);
        }
    }

    public writeUInt16Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 2);
        const writeView = this.writeView;
        for (let i = 0, size = arr.length; i < size; i++) {
            writeView.setUint16(offset + i, arr[i]);
        }
    }

    public writeUInt32Array(arr: ArrayLike<number>) {
        const offset = this.allocate(arr.length * 4);
        const writeView = this.writeView;
        for (let i = 0, size = arr.length; i < size; i++) {
            writeView.setUint32(offset + i, arr[i]);
        }
    }

    public readFloat32() {
        return this.readView.getFloat32(this.prepareRead(4));
    }

    public readFloat64() {
        return this.readView.getFloat64(this.prepareRead(8));
    }

    public readInt8() {
        return this.readView.getInt8(this.prepareRead(1));
    }

    public readInt16() {
        return this.readView.getInt16(this.prepareRead(2));
    }

    public readInt32() {
        return this.readView.getInt32(this.prepareRead(4));
    }

    public readUInt8() {
        return this.readView.getUint8(this.prepareRead(1));
    }

    public readUInt16() {
        return this.readView.getUint16(this.prepareRead(2));
    }

    public readUInt32() {
        return this.readView.getUint32(this.prepareRead(4));
    }

    public readFloat32Array(amount: number) {
        const offset = this.prepareRead(amount * 4);
        return new Float32Array(this.readBuffer, offset, amount);
    }

    public readFloat64Array(amount: number) {
        const offset = this.prepareRead(amount * 8);
        return new Float64Array(this.readBuffer, offset, amount);
    }

    public readInt8Array(amount: number) {
        const offset = this.prepareRead(amount);
        return new Int8Array(this.readBuffer, offset, amount);
    }

    public readInt16Array(amount: number) {
        const offset = this.prepareRead(amount * 2);
        return new Int16Array(this.readBuffer, offset, amount);
    }

    public readInt32Array(amount: number) {
        const offset = this.prepareRead(amount * 4);
        return new Int32Array(this.readBuffer, offset, amount);
    }

    public readUInt8Array(amount: number) {
        const offset = this.prepareRead(amount);
        return new Uint8Array(this.readBuffer, offset, amount);
    }

    public readUInt16Array(amount: number) {
        const offset = this.prepareRead(amount * 2);
        return new Uint16Array(this.readBuffer, offset, amount);
    }

    public readUInt32Array(amount: number) {
        const offset = this.prepareRead(amount * 4);
        return new Uint32Array(this.readBuffer, offset, amount);
    }
}

export class ArrayBufferProtocol extends Protocol {
    private writeBuffers: ArrayBuffer[] = [];

    protected writeBuffer: ArrayBuffer;
    protected writeView: DataView;
    protected writeOffset = 0;

    private readBuffers: ArrayBuffer[] = [];
    private readBufferIndex = 0;

    protected readBuffer: ArrayBuffer;
    protected readView: DataView;
    protected readOffset = 0;

    public passData(data: ArrayBuffer) {
        this.writeBuffers.push(data);
    }

    public getData() {
        return this.readBuffers[++this.readBufferIndex];
    }

    protected allocate(needSpace: number): number {
        if (!this.writeBuffer) {
            this.writeBuffer = new ArrayBuffer(Math.max(needSpace, DEFAULT_BUFFER_SIZE));
            this.writeView = new DataView(this.writeBuffer);
            this.writeBuffers.push(this.writeBuffer);
            return 0;
        }

        const offset = this.writeOffset;
        const newOffset = offset + needSpace;

        if (newOffset > this.writeBuffer.byteLength) {
            this.writeBuffer = null;
            this.writeView = null;
            this.writeOffset = 0;
            return this.allocate(needSpace);
        }

        this.writeOffset = newOffset;

        return offset;
    }

    protected prepareRead(amount: number): number {
        const offset = this.readOffset;
        const newOffset = offset + amount;

        if (newOffset > this.readBuffer.byteLength) {
            this.readBuffer = this.readBuffers[++this.readBufferIndex];
            this.readView = new DataView(this.readBuffer);
            this.readOffset = 0;
            return this.prepareRead(amount);
        }

        this.readOffset = newOffset;

        return offset;
    }

    public setReadBuffers(buffers: ArrayBuffer[]) {
        const oldBuffers = this.readBuffers;

        this.readBuffers = buffers;
        this.readBufferIndex = 0;

        this.readBuffer = buffers[0];
        this.readView = new DataView(this.readBuffer);
        this.readOffset = 0;

        return oldBuffers;
    }

    public popWriteBuffers() {
        const oldBuffers = this.writeBuffers;

        this.writeBuffer = null;
        this.writeView = null;
        this.writeOffset = 0;
        this.writeBuffers = [];

        return oldBuffers;
    }
}
