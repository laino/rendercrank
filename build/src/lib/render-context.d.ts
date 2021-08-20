import { BufferRef, ArrayBufferViewLikeType } from './resources';
export declare type RenderContextID = number;
export declare namespace RenderContextID {
    function nextID(): RenderContextID;
}
export declare class RenderContext {
    readonly id: RenderContextID;
    bufferPool: BufferPool;
    float32BufferPool: BufferPoolView;
}
declare class BufferPoolView {
    pool: BufferPool;
    type: ArrayBufferViewLikeType;
    private currentBuffer;
    private currentView;
    constructor(pool: BufferPool, type: ArrayBufferViewLikeType);
    writeMultiData(multi: ArrayLike<number>[], totalLength: number): {
        buffer: BufferRef;
        byteOffset: any;
        byteLength: number;
    };
    writeData(data: ArrayLike<number>): {
        buffer: BufferRef;
        byteOffset: any;
        byteLength: number;
    };
}
declare class BufferPool {
    context: RenderContext;
    private buffers;
    private buffersIndex;
    currentBuffer: BufferRef;
    currentBufferOffset: number;
    constructor(context: RenderContext);
    reset(): void;
    allocateSpace(amount: number): any;
}
export {};
