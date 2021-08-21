import { ResourceRef } from './resource';
import { Instructor } from './instructor';

export const DEBUG = true;

export interface Renderable<C extends RenderContext> {
    render(context: C);
}

export abstract class RenderContext {
    public resources = new Set<ResourceRef>();

    private unloadResources = new Set<ResourceRef>();

    public addResource(resource: ResourceRef) {
        if (this.resources.add(resource)) {
            resource.refcount++;
            this.unloadResources.delete(resource);
        }
    }

    public removeResource(resource: ResourceRef) {
        if (this.resources.delete(resource)) {
            resource.refcount--;
            this.unloadResources.add(resource);
        }
    }

    public unload(instructor: Instructor) {
        for (const resource of this.resources) {
            resource.refcount--;
            instructor.unloadResource(resource);
        }

        for (const resource of this.unloadResources) {
            instructor.unloadResource(resource);
        }

        this.resources.clear();
    }

    public submit(instructor: Instructor) {
        this._submit(instructor);

        if (this.unloadResources.size) {
            for (const resource of this.unloadResources) {
                instructor.unloadResource(resource);
            }

            this.unloadResources.clear();
        }
    }

    protected abstract _submit(instructor: Instructor);
}

export interface Renderer<C extends RenderContext> {
    render(renderable: Renderable<C>);
    unload(context: RenderContext);
    reset();
}
