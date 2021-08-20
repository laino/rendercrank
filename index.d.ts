declare module "core/protocol" {
    export abstract class Protocol {
        private textEncoder;
        private textDecoder;
        protected writeBuffer: ArrayBuffer;
        protected writeView: DataView;
        protected writeOffset: number;
        protected abstract allocate(needSpace: number): number;
        protected readBuffer: ArrayBuffer;
        protected readView: DataView;
        protected readOffset: number;
        protected abstract prepareRead(amount: number): number;
        abstract passData(data: ArrayBufferLike): any;
        abstract getData(): ArrayBufferLike;
        writeString(str: string): void;
        readString(): string;
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
    export class ArrayBufferProtocol extends Protocol {
        private writeBuffers;
        protected writeBuffer: ArrayBuffer;
        protected writeView: DataView;
        protected writeOffset: number;
        private readBuffers;
        private readBufferIndex;
        protected readBuffer: ArrayBuffer;
        protected readView: DataView;
        protected readOffset: number;
        passData(data: ArrayBuffer): void;
        getData(): ArrayBuffer;
        protected allocate(needSpace: number): number;
        protected prepareRead(amount: number): number;
        receive(buffers: ArrayBuffer[]): ArrayBuffer[];
        send(): ArrayBuffer[];
    }
}
declare module "resources/resource" {
    import { Protocol } from "core/index";
    export enum ResourceState {
        UNLOADED = 0,
        LOADING = 1,
        LOADED = 2,
        READY = 3
    }
    export type ResourceID = number;
    export namespace ResourceID {
        function nextID(): ResourceID;
    }
    export abstract class ResourceRef {
        readonly type: typeof Resource;
        readonly id: ResourceID;
        state: ResourceState;
        refcount: number;
        needsUpdate: boolean;
        constructor(type: typeof Resource);
        load(): Promise<void> | void;
        writeData(protocol: Protocol): void;
        writeUpdate(protocol: Protocol): void;
        onUnload(): void;
    }
    export abstract class Resource {
        gl: WebGL2RenderingContext;
        constructor(gl: WebGL2RenderingContext);
        abstract load(protocol: Protocol): any;
        abstract update(protocol: Protocol): any;
        abstract unload(): Promise<void> | void;
    }
}
declare module "resources/buffer" {
    import { Resource, ResourceRef } from "resources/resource";
    import { Protocol } from "core/index";
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
    export class BufferRef extends ResourceRef {
        buffer: ArrayBuffer;
        private updates;
        private byteView;
        private isShared;
        readonly size: number;
        constructor(buffer: ArrayBuffer);
        notify(offset: number, length: number): void;
        writeData(protocol: Protocol): void;
        writeUpdate(protocol: Protocol): void;
        onUnload(): void;
    }
    export class Buffer extends Resource {
        buffer: WebGLBuffer;
        private sharedBuffer;
        load(protocol: Protocol): void;
        update(protocol: Protocol): void;
        unload(): void;
    }
}
declare module "resources/program" {
    import { Resource, ResourceRef } from "resources/resource";
    import { Protocol } from "core/index";
    export type AttributeType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat2' | 'mat3' | 'mat4' | 'int' | 'ivec2' | 'ivec3' | 'ivec4' | 'uint' | 'uvec2' | 'uvec3' | 'uvec4';
    export type UniformType = AttributeType | 'bool' | 'bvec2' | 'bvec3' | 'bvec4';
    export type AttributeMap = Record<string, AttributeType>;
    export type UniformMap = Record<string, UniformType>;
    export interface ProgramDefinition {
        vertexShader?: string;
        fragmentShader?: string;
        attributes?: AttributeMap;
        uniforms?: UniformMap;
    }
    export class ProgramRef extends ResourceRef {
        private def;
        constructor(def: ProgramDefinition);
        writeData(protocol: Protocol): void;
    }
    export class Program extends Resource {
        private attributes;
        private uniforms;
        private vertexShader;
        private fragmentShader;
        private program;
        load(protocol: Protocol): void;
        update(): void;
        unload(): void;
    }
}
declare module "resources/index" {
    export * from "resources/resource";
    export * from "resources/buffer";
    export * from "resources/program";
}
declare module "core/renderer" {
    import { Protocol } from "core/protocol";
    import { Resource } from "resources/index";
    export function registerResourceType(resource: typeof Resource): void;
    export class CanvasRenderer {
        canvas: HTMLCanvasElement;
        gl: WebGL2RenderingContext;
        constructor(canvas: HTMLCanvasElement);
        render(protocol: Protocol): void;
    }
}
declare module "core/render-context" {
    import { ResourceRef, BufferRef, ArrayBufferViewLikeType } from "resources/index";
    export type RenderContextID = number;
    export namespace RenderContextID {
        function nextID(): RenderContextID;
    }
    export class RenderContext {
        readonly id: RenderContextID;
        resources: Set<ResourceRef>;
        bufferPool: BufferPool;
        float32BufferPool: BufferPoolView;
        addResource(resource: ResourceRef): void;
        removeResource(resource: ResourceRef): void;
        removeAllResources(): void;
    }
    class BufferPoolView {
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
    class BufferPool {
        context: RenderContext;
        private buffers;
        private buffersIndex;
        currentBuffer: BufferRef;
        currentBufferOffset: number;
        constructor(context: RenderContext);
        reset(): void;
        allocateSpace(amount: number): any;
    }
}
declare module "core/render-target" {
    import { Protocol } from "core/protocol";
    import { Component } from "core/component";
    import { RenderContext } from "core/render-context";
    import { ResourceRef, ProgramRef } from "resources/index";
    export const ColoredTrianglesProgram: ProgramRef;
    export class RenderTarget {
        zIndex: number;
        private usedResources;
        private context;
        private drawCallBatcher;
        render(component: Component): void;
        addResource(resource: ResourceRef): void;
        submit(protocol: Protocol): void;
        rect(x: number, y: number, width: number, height: number): void;
        triangles(data: number[]): void;
        private submitResources;
    }
    export class DrawCallBatcher {
        private batchedPrograms;
        drawTriangles(context: RenderContext, program: ProgramRef, data: number[]): void;
        submit(protocol: Protocol): void;
    }
}
declare module "core/component" {
    import { RenderTarget } from "core/render-target";
    import { RenderContext } from "core/render-context";
    export type RenderFunction = (target: RenderTarget) => Promise<void> | void;
    export class Component extends RenderContext {
        fn: RenderFunction;
        constructor(fn: RenderFunction);
    }
}
declare module "core/index" {
    export * from "core/renderer";
    export * from "core/protocol";
    export * from "core/component";
    export * from "core/render-context";
    export * from "core/render-target";
}
declare module "index" {
    export * from "core/index";
    export * from "resources/index";
}
