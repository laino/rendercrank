import { Protocol } from './protocol';
import { Renderer } from './renderer';

export const RESOURCE_MAP: Record<string, typeof Resource> = {};

export function registerResourceType(resource: typeof Resource) {
    if (Object.prototype.hasOwnProperty.call(RESOURCE_MAP, resource.name)) {
        throw new Error(`A resource type with the name ${resource.name} is already registered.`);
    }

    RESOURCE_MAP[resource.name] = resource;
}

export enum ResourceState {
    UNLOADED,
    LOADING,
    LOAD_ABORTED,
    LOADED,
    READY,
}

let RESOURCE_ID_COUNTER = 0;

export type ResourceID = number;
export namespace ResourceID {
    export function nextID(): ResourceID {
        return RESOURCE_ID_COUNTER++;
    }
}

export abstract class ResourceRef {
    public readonly id: ResourceID = ResourceID.nextID();

    public state: ResourceState = ResourceState.UNLOADED;
    public refcount = 0;
    public needsUpdate = false;

    public constructor(public readonly type: typeof Resource) {
    }

    public load(): Promise<void> | void {
        // overwrite
    }

    public writeData(protocol: Protocol) {
        // overwrite
    }

    public writeUpdate(protocol: Protocol) {
        // overwrite
    }

    public onUnload() {
        // overwrite
        this.needsUpdate = false;
    }
}

export abstract class Resource {
    public constructor(public renderer: Renderer) {
    }

    public abstract load(protocol: Protocol);
    public abstract update(protocol: Protocol);
    public abstract unload();
}
