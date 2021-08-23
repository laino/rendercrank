import { ResourceRef } from './resource';
import { Instructor } from './instructor';

/*
 * A renderer draws {@link Renderable}s onto - for instance - a canvas.
 */
export interface Renderer<C extends RenderContext> {
    /*
     * Queues a new render.
     *
     * @returns Promise resolves when the rendered content appeared on screen.
     */
    render(renderable: Renderable<C>): Promise<void>;

    /*
     * Dereferences and unloads resources used by a context.
     *
     * @returns Promise resolves when everything has been unloaded.
     */
    unload(context: RenderContext): Promise<void>;

    /*
     * Dereferences and unloads resources used by the renderer itself.
     *
     * @returns see {@link Renderer.unload}
     */
    reset(): Promise<void>;
}

/*
 * Something that can be drawn using a {@link RenderContext}.
 */
export interface Renderable<C extends RenderContext> {
    render(context: C);
}

/*
 * A RenderContext keeps track of used {@link ResourceRef}s
 * and may expose draw calls.
 */
export abstract class RenderContext {
    /*
     * Resoures used within this context.
     */
    public resources = new Set<ResourceRef>();

    private unloadResources = new Set<ResourceRef>();

    /*
     * Adds a {@link ResourceRef} to be tracked.
     */
    public addResource(resource: ResourceRef) {
        if (this.resources.add(resource)) {
            resource.refcount++;
            this.unloadResources.delete(resource);
        }
    }

    /*
     * Removes a {@link ResourceRef} from the tracked resources.
     *
     * It will only be unloaded on the next call to {@link RenderContext.submit} or
     * {@link RenderContext.unload}.
     */
    public removeResource(resource: ResourceRef) {
        if (this.resources.delete(resource)) {
            resource.refcount--;
            this.unloadResources.add(resource);
        }
    }

    /*
     * Submits pending draw calls to a {@link Instructor}.
     */
    public submit(instructor: Instructor) {
        this._submit(instructor);

        if (this.unloadResources.size) {
            for (const resource of this.unloadResources) {
                instructor.unloadResource(resource);
            }

            this.unloadResources.clear();
        }
    }

    public unload(instructor: Instructor) {
        for (const resource of this.unloadResources) {
            instructor.unloadResource(resource);
        }

        for (const resource of this.resources) {
            resource.refcount--;
            instructor.unloadResource(resource);
        }

        this.unloadResources.clear();
        this.resources.clear();
    }


    protected abstract _submit(instructor: Instructor);
}

