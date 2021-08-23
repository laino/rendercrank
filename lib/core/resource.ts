import { ProtocolReader, ProtocolWriter } from './protocol';
import { RunnerContext } from "./runner";
import { InstructorContext } from "./instructor";

export const RESOURCE_MAP: Record<string, ResourceConstructable> = {};

export interface ResourceConstructable {
    readonly resourceName: string;

    new(context: RunnerContext): Resource;
}

export function registerResourceType(resource: ResourceConstructable) {
    const name = resource.resourceName;

    if (name === 'Resource') {
        throw new Error(`Resource name can't be "Resource".`);
    }

    if (Object.prototype.hasOwnProperty.call(RESOURCE_MAP, name)) {
        throw new Error(`A resource type with the name ${name} is already registered.`);
    }

    RESOURCE_MAP[name] = resource;
}

export enum ResourceRefState {
    UNLOADED,
    LOADING,
    LOAD_ABORTED,
    LOADED,
    READY,
}

let RESOURCE_ID_COUNTER = 0;

export type ResourceId = number;
export namespace ResourceId {
    export function nextID(): ResourceId {
        return RESOURCE_ID_COUNTER++;
    }
}

const resolve = Promise.resolve(void 0);

export abstract class ResourceRef {
    private loadPromise: Promise<void> = resolve;

    public readonly id: ResourceId = ResourceId.nextID();

    public state: ResourceRefState = ResourceRefState.UNLOADED;
    public refcount = 0;
    public needsUpdate = false;

    public constructor(public readonly type: ResourceConstructable) {
    }

    // eslint-disable-next-line
    public load(): Promise<void> {
        if (this.state === ResourceRefState.LOAD_ABORTED) {
            this.state = ResourceRefState.LOADING;
            return;
        }

        if (this.state !== ResourceRefState.UNLOADED) {
            return resolve;
        }

        this.state = ResourceRefState.LOADING;

        const result = this.prepare();

        if (!result) {
            this.state = ResourceRefState.LOADED;
            return resolve;
        }

        return this.loadPromise = result.then(() => {
            this.loadPromise = resolve;

            if (this.state !== ResourceRefState.LOAD_ABORTED) {
                this.state = ResourceRefState.LOADED;
            }
        });
    }

    public ready(protocol: ProtocolWriter) {
        if (this.state !== ResourceRefState.LOADED) {
            return;
        }

        this.loadResource(protocol);

        this.state = ResourceRefState.READY;
    }

    public update(protocol: ProtocolWriter) {
        if (this.state !== ResourceRefState.READY || !this.needsUpdate) {
            return;
        }

        this.needsUpdate = false;

        this.updateResource(protocol);
    }

    // eslint-disable-next-line
    public unready(protocol: ProtocolWriter) {
        if (this.state !== ResourceRefState.READY) {
            return;
        }

        this.unloadResource(protocol);

        this.state = ResourceRefState.LOADED;
    }

    public unload() {
        if (this.state === ResourceRefState.LOADING) {
            this.state = ResourceRefState.LOAD_ABORTED;
            this.loadPromise.then(() => {
                if (this.state === ResourceRefState.LOAD_ABORTED) {
                    this.state = ResourceRefState.LOADED;
                    this.unload();
                }
            });
            return;
        }

        // cannot unload if we're still used somewhere
        if (this.state !== ResourceRefState.LOADED) {
            return;
        }

        this.reset();

        this.state = ResourceRefState.UNLOADED;
    }

    // eslint-disable-next-line
    protected prepare(): Promise<void> | void {
        // overwrite
    }

    // eslint-disable-next-line
    protected loadResource(protocol: ProtocolWriter) {
        // overwrite
    }

    // eslint-disable-next-line
    protected updateResource(protocol: ProtocolWriter) {
        // overwrite
    }

    // eslint-disable-next-line
    protected unloadResource(protocol: ProtocolWriter) {
        // overwrite
    }

    // eslint-disable-next-line
    protected reset() {
        // overwrite
    }
}

export enum ResourceYieldUntil {
    LATER,
    BARRIER,
    FINALIZE,
    STABLE
}

export abstract class Resource {
    static readonly resourceName: string = 'Resource';

    public operationsCount = 0;

    public constructor(public context: RunnerContext) {
    }

    // eslint-disable-next-line
    public load(protocol: ProtocolReader): void | Generator<ResourceYieldUntil> {
        // overwrite
    }

    // eslint-disable-next-line
    public update(protocol: ProtocolReader): void | Generator<ResourceYieldUntil> {
        // overwrite
    }

    // eslint-disable-next-line
    public unload(protocol: ProtocolReader): void | Generator<ResourceYieldUntil> {
        // overwrite
    }
}
