export declare abstract class ProtocolWriter {
    readonly shared: boolean;
    private textEncoder;
    protected writeBuffer: ArrayBuffer;
    protected writeView: DataView;
    protected writeOffset: number;
    constructor(shared?: boolean);
    protected abstract allocate(amount: number, align: number): number;
    abstract createWriter(): ProtocolWriter;
    abstract advance(): any;
    abstract passData(data: ArrayBufferLike): any;
    abstract flush(): ArrayBuffer[];
    writeString(str: string): void;
    writeFloat32(num: number): void;
    writeFloat64(num: number): void;
    writeInt8(num: number): void;
    writeInt16(num: number): void;
    writeInt32(num: number): void;
    writeUInt8(num: number): void;
    writeUInt16(num: number): void;
    writeUInt32(num: number): void;
    writeFloat32Array(arr: ArrayLike<number>): void;
    writeFloat64Array(arr: ArrayLike<number>): void;
    writeInt8Array(arr: ArrayLike<number>): void;
    writeInt16Array(arr: ArrayLike<number>): void;
    writeInt32Array(arr: ArrayLike<number>): void;
    writeUInt8Array(arr: ArrayLike<number>): void;
    writeUInt16Array(arr: ArrayLike<number>): void;
    writeUInt32Array(arr: ArrayLike<number>): void;
}
export declare abstract class ProtocolReader {
    readonly shared: boolean;
    private textDecoder;
    protected readBuffer: ArrayBuffer;
    protected readView: DataView;
    protected readOffset: number;
    constructor(shared?: boolean);
    protected abstract prepareRead(amount: number, align: number): number;
    abstract getData(): ArrayBufferLike;
    abstract advance(): any;
    readString(): string;
    readFloat32(): number;
    readFloat64(): number;
    readInt8(): number;
    readInt16(): number;
    readInt32(): number;
    readUInt8(): number;
    readUInt16(): number;
    readUInt32(): number;
    readFloat32Array(amount: number): Float32Array;
    readFloat64Array(amount: number): Float64Array;
    readInt8Array(amount: number): Int8Array;
    readInt16Array(amount: number): Int16Array;
    readInt32Array(amount: number): Int32Array;
    readUInt8Array(amount: number): Uint8Array;
    readUInt16Array(amount: number): Uint16Array;
    readUInt32Array(amount: number): Uint32Array;
}
declare class ProtocolBufferAllocator {
    private buffers;
    private bufferIndex;
    allocate(amount: number): ArrayBuffer;
    return(arr: ArrayBuffer[]): void;
    reset(): void;
}
export declare class ArrayBufferProtocolWriter extends ProtocolWriter {
    private allocator;
    private writeBuffers;
    protected writeBuffer: ArrayBuffer;
    protected writeView: DataView;
    protected writeOffset: number;
    constructor(shared?: boolean, allocator?: ProtocolBufferAllocator);
    advance(): void;
    passData(data: ArrayBuffer): void;
    createWriter(): ArrayBufferProtocolWriter;
    protected allocate(amount: number, align: number): number;
    flush(): ArrayBuffer[];
}
export declare class ArrayBufferProtocolReader extends ProtocolReader {
    private readBuffers;
    private readBufferIndex;
    protected readBuffer: ArrayBuffer;
    protected readView: DataView;
    protected readOffset: number;
    getData(): ArrayBuffer;
    advance(): void;
    protected prepareRead(amount: number, align: number): number;
    receive(buffers: ArrayBuffer[]): ArrayBuffer[];
}
export {};
