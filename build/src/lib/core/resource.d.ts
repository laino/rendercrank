import { ProtocolReader, ProtocolWriter } from './protocol';
import { Renderer } from './renderer';
export declare const RESOURCE_MAP: Record<string, typeof Resource>;
export declare function registerResourceType(resource: typeof Resource): void;
export declare enum ResourceState {
    UNLOADED = 0,
    LOADING = 1,
    LOAD_ABORTED = 2,
    LOADED = 3,
    READY = 4
}
export declare type ResourceID = number;
export declare namespace ResourceID {
    function nextID(): ResourceID;
}
export declare abstract class ResourceRef {
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
export declare abstract class Resource {
    renderer: Renderer;
    static readonly resourceName: string;
    constructor(renderer: Renderer);
    abstract load(protocol: ProtocolReader): any;
    abstract update(protocol: ProtocolReader): any;
    abstract unload(): any;
}
