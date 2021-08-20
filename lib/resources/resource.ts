import { Renderer, Protocol } from '../core';

export enum ResourceState {
    UNLOADED,
    LOADING,
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
    public refcount: number;
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
    public abstract unload(): Promise<void> | void;
}
