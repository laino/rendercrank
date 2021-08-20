import { ResourceRef } from './resource';
import { Instructor } from './instructor';

export class RenderContext {
    public resources = new Set<ResourceRef>();

    public addResource(resource: ResourceRef) {
        resource.refcount++;
        this.resources.add(resource);
    }

    public unload(instructor: Instructor) {
        for (const resource of this.resources) {
            resource.refcount--;
            instructor.unloadResource(resource);
        }

        this.resources.clear();
    }
}

