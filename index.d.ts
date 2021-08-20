declare module "core/protocol" {
    export abstract class ProtocolWriter {
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
    export abstract class ProtocolReader {
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
    class ProtocolBufferAllocator {
        private buffers;
        private bufferIndex;
        allocate(amount: number): ArrayBuffer;
        return(arr: ArrayBuffer[]): void;
        reset(): void;
    }
    export class ArrayBufferProtocolWriter extends ProtocolWriter {
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
    export class ArrayBufferProtocolReader extends ProtocolReader {
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
}
declare module "core/resource" {
    import { ProtocolReader, ProtocolWriter } from "core/protocol";
    import { Renderer } from "core/renderer";
    export const RESOURCE_MAP: Record<string, typeof Resource>;
    export function registerResourceType(resource: typeof Resource): void;
    export enum ResourceState {
        UNLOADED = 0,
        LOADING = 1,
        LOAD_ABORTED = 2,
        LOADED = 3,
        READY = 4
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
        writeData(protocol: ProtocolWriter): void;
        writeUpdate(protocol: ProtocolWriter): void;
        onUnload(): void;
    }
    export abstract class Resource {
        renderer: Renderer;
        constructor(renderer: Renderer);
        abstract load(protocol: ProtocolReader): any;
        abstract update(protocol: ProtocolReader): any;
        abstract unload(): any;
    }
}
declare module "core/instructor" {
    import { ProtocolWriter } from "core/protocol";
    import { ResourceRef } from "core/resource";
    import { Command } from "core/command";
    export enum Instruction {
        STOP = 0,
        RUN_COMMAND = 1,
        MAP_COMMAND = 2,
        UPDATE_RESOURCE = 3,
        LOAD_RESOURCE = 4,
        UNLOAD_RESOURCE = 5,
        ADVANCE = 6
    }
    export class Instructor {
        private protocol;
        private mappedCommands;
        resources: Set<ResourceRef>;
        private commandProtocol;
        constructor(protocol: ProtocolWriter);
        command<C extends Command>(command: C, ...args: C extends Command<infer A> ? A : never): void;
        finish(): void;
        loadResource(resource: ResourceRef): void;
        unloadResource(resource: ResourceRef): void;
    }
}
declare module "core/command" {
    import { Renderer } from "core/renderer";
    import { ProtocolReader, ProtocolWriter } from "core/protocol";
    import { Instructor } from "core/instructor";
    export const COMMAND_MAP: Record<string, Command>;
    export interface Command<A extends any[] = any[]> {
        name: string;
        submit(instructor: Instructor, protocol: ProtocolWriter, ...args: A): void;
        render(protocol: ProtocolReader, renderer: Renderer): any;
    }
    export function Command<A extends any[]>(def: Command<A>): Command<A>;
}
declare module "core/renderer" {
    import { Resource, ResourceID } from "core/resource";
    import { ProtocolReader } from "core/protocol";
    export interface Renderer {
        gl: WebGL2RenderingContext;
        getResource<T extends typeof Resource>(id: ResourceID, type: T): InstanceType<T>;
        render(protocol: ProtocolReader): any;
    }
    export class CanvasRenderer implements Renderer {
        canvas: HTMLCanvasElement;
        gl: WebGL2RenderingContext;
        private resources;
        constructor(canvas: HTMLCanvasElement);
        getResource<T extends typeof Resource>(id: ResourceID, type: T): InstanceType<T>;
        render(protocol: ProtocolReader): void;
    }
}
declare module "core/index" {
    export * from "core/renderer";
    export * from "core/resource";
    export * from "core/command";
    export * from "core/protocol";
    export * from "core/instructor";
}
declare module "resources/buffer" {
    import { ProtocolReader, ProtocolWriter, Resource, ResourceRef } from "core/index";
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
        writeData(protocol: ProtocolWriter): void;
        writeUpdate(protocol: ProtocolWriter): void;
        onUnload(): void;
    }
    export class Buffer extends Resource {
        buffer: WebGLBuffer;
        private sharedBuffer;
        load(protocol: ProtocolReader): void;
        update(protocol: ProtocolReader): void;
        unload(): void;
    }
}
declare module "resources/program" {
    import { Resource, ResourceRef, ProtocolReader, ProtocolWriter } from "core/index";
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
        writeData(protocol: ProtocolWriter): void;
    }
    export class Program extends Resource {
        private attributes;
        private uniforms;
        private vertexShader;
        private fragmentShader;
        private program;
        load(protocol: ProtocolReader): void;
        update(): void;
        unload(): void;
    }
}
declare module "resources/index" {
    export * from "resources/buffer";
    export * from "resources/program";
}
declare module "render-context" {
    import { BufferRef, ArrayBufferViewLikeType } from "resources/index";
    export type RenderContextID = number;
    export namespace RenderContextID {
        function nextID(): RenderContextID;
    }
    export class RenderContext {
        readonly id: RenderContextID;
        bufferPool: BufferPool;
        float32BufferPool: BufferPoolView;
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
declare module "commands/run-program" {
    import { Command } from "core/index";
    import { ProgramRef, BufferRef } from "resources/index";
    export interface RunProgramOptions {
        program: ProgramRef;
        buffer: BufferRef;
        offset: number;
        length: number;
    }
    export const RunProgram: Command<[options: RunProgramOptions]>;
}
declare module "commands/index" {
    export * from "commands/run-program";
}
declare module "programs/colored-triangles" {
    import { ProgramRef } from "resources/index";
    export const ColoredTrianglesProgram: ProgramRef;
}
declare module "programs/index" {
    export * from "programs/colored-triangles";
}
declare module "render-target" {
    import { Instructor } from "core/index";
    import { RenderContext } from "render-context";
    import { ProgramRef } from "resources/index";
    export class RenderTarget {
        private context;
        zIndex: number;
        private drawCallBatcher;
        constructor(context: RenderContext);
        submit(instructor: Instructor): void;
        rect(x: number, y: number, width: number, height: number): void;
        triangles(data: number[]): void;
    }
    export class DrawCallBatcher {
        private programs;
        private batchedPrograms;
        drawTriangles(context: RenderContext, program: ProgramRef, data: number[]): void;
        submit(instructor: Instructor): void;
    }
}
declare module "component" {
    import { ProtocolWriter } from "core/index";
    import { RenderTarget } from "render-target";
    import { RenderContext } from "render-context";
    export type RenderFunction = (target: RenderTarget) => Promise<void> | void;
    export class Component extends RenderContext {
        fn: RenderFunction;
        private resources;
        private renderTarget;
        constructor(fn: RenderFunction);
        render(protocol: ProtocolWriter): void;
        unload(protocol: ProtocolWriter): void;
    }
}
declare module "single-threaded-renderer" {
    import { CanvasRenderer } from "core/index";
    import { Component } from "component";
    export class SingleThreadedCanvasRenderer extends CanvasRenderer {
        private protocolWriter;
        private protocolReader;
        renderComponent(component: Component): void;
    }
}
declare module "index" {
    export * from "core/index";
    export * from "resources/index";
    export * from "commands/index";
    export * from "render-target";
    export * from "render-context";
    export * from "component";
    export * from "single-threaded-renderer";
}
