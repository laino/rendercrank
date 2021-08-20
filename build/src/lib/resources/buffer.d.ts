import { ProtocolReader, ProtocolWriter, Resource, ResourceRef } from '../core';
export interface ArrayBufferViewLike extends ArrayBufferView {
    readonly BYTES_PER_ELEMENT: number;
    readonly length: number;
    set(data: ArrayLike<number>, offset: number): void;
}
export interface ArrayBufferViewLikeType {
    readonly BYTES_PER_ELEMENT: number;
    new (buffer: ArrayBufferLike): ArrayBufferViewLike;
    new (length: number): ArrayBufferViewLike;
}
export declare class BufferRef extends ResourceRef {
    buffer: ArrayBuffer;
    private updates;
    private byteView;
    private isShared;
    readonly size: number;
    constructor(buffer: ArrayBuffer);
    notify(offset: number, length: number): void;
    writeData(protocol: ProtocolWriter): void;
    writeUpdate(protocol: ProtocolWriter): void;
    onUnload(): void;
}
export declare class Buffer extends Resource {
    static resourceName: string;
    buffer: WebGLBuffer;
    private sharedBuffer;
    load(protocol: ProtocolReader): void;
    update(protocol: ProtocolReader): void;
    unload(): void;
}
