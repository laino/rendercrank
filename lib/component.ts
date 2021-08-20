import { Protocol, Instructor, ResourceRef } from './core';

import { RenderTarget } from './render-target';
import { RenderContext } from './render-context';

export type RenderFunction = (target: RenderTarget) => Promise<void> | void;

export class Component extends RenderContext {
    private resources = new Set<ResourceRef>();
    private renderTarget = new RenderTarget(this);

    public constructor(public fn: RenderFunction) {
        super();
    }

    public render(protocol: Protocol) {
        this.fn(this.renderTarget);

        const instructor = new Instructor(protocol);

        this.renderTarget.submit(instructor);

        for (const resource of instructor.resources) {
            resource.refcount++;
            this.resources.add(resource);
        }
    }

    public unload(protocol: Protocol) {
        const instructor = new Instructor(protocol);

        for (const resource of this.resources) {
            resource.refcount--;
            instructor.unloadResource(resource);
        }
    }
}
