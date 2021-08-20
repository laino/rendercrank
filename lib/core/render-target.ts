import { Protocol } from './protocol';
import { Component } from './component';
import { RenderContext } from './render-context';
import { ResourceRef, ProgramRef, ResourceState } from '../resources';

export const ColoredTrianglesProgram = new ProgramRef({
    attributes: {
        color: 'vec4',
        position: 'vec4',
    },
    vertexShader: `
        out vec4 vColor;

        void main() {
            vColor = color;
            gl_Position = position;
        }
    `,
    fragmentShader: `
        in vec4 vColor;
         
        out vec4 outColor;
         
        void main() {
          outColor = vColor;
        }
    `,
});

export class RenderTarget {
    public zIndex = 0;

    private usedResources = new Set<ResourceRef>();
    private context: RenderContext;

    private drawCallBatcher = new DrawCallBatcher();

    public render(component: Component) {
        this.context = component;

        component.fn(this);
    }

    public addResource(resource: ResourceRef) {
        this.usedResources.add(resource);
        this.context.addResource(resource);
    }

    public submit(protocol: Protocol) {
        this.submitResources(protocol);
        this.drawCallBatcher.submit(protocol);
    }

    private submitResources(protocol: Protocol) {
        for (const resource of this.usedResources) {
            if (resource.refcount === 0 && resource.state === ResourceState.READY) {
                protocol.writeUInt8(2); // unload resource
                protocol.writeUInt32(resource.id);
                resource.onUnload();
                resource.state = ResourceState.UNLOADED;
                this.usedResources.delete(resource);
                continue;
            }

            if (resource.state === ResourceState.UNLOADED) {
                resource.state = ResourceState.LOADING;

                const result = resource.load();

                if (result) {
                    result.then(() => {
                        resource.state = ResourceState.LOADED;
                    });
                    continue;
                }

                resource.state = ResourceState.LOADED;
            }

            if (resource.state === ResourceState.LOADED) {
                protocol.writeUInt8(1); // load resource
                protocol.writeUInt32(resource.id);
                protocol.writeString(resource.type.name);
                resource.writeData(protocol);

                resource.state = ResourceState.READY;
            }

            if (resource.needsUpdate) {
                resource.needsUpdate = false;
                protocol.writeUInt8(3); // update resource
                protocol.writeUInt32(resource.id);
                resource.writeUpdate(protocol);
            }
        }

        protocol.writeUInt8(0); // end of resources
    }

    public drawRect(x: number, y: number, width: number, height: number) {
        const z = this.zIndex++;

        this.drawTriangles([
            x,         y         , z,
            x + width, y         , z,
            x + width, y + height, z,
            x,         y         , z,
            x + width, y + height, z,
            x        , y + height, z,
        ]);
    }

    public drawTriangles(data: number[]) {
        this.drawCallBatcher.drawTriangles(this.context, ColoredTrianglesProgram, data);
    }
}

interface ProgramCall {
    context: RenderContext,
    program: ProgramRef,
    triangles: number[][],
    trianglesLength: number
}

export class DrawCallBatcher {
    private batchedPrograms: Record<string, ProgramCall> = {};

    public drawTriangles(context: RenderContext, program: ProgramRef, data: number[]) {
        const ID = `${context.id}:${program.id}`;

        const batch = this.batchedPrograms[ID];

        if (!batch) {
            this.batchedPrograms[ID] = {
                context,
                program,
                triangles: [data],
                trianglesLength: data.length
            };

            return;
        }

        batch.triangles.push(data);
        batch.trianglesLength += data.length;
    }

    public submit(protocol: Protocol) {
        for (const {context, program, triangles, trianglesLength} of Object.values(this.batchedPrograms)) {
            const {
                buffer,
                byteOffset,
            } = context.float32BufferPool.writeMultiData(triangles, trianglesLength);

            protocol.writeUInt8(1); // run program
            protocol.writeUInt32(program.id);
            protocol.writeUInt32(buffer.id);
            protocol.writeUInt32(byteOffset);
            protocol.writeUInt32(trianglesLength);
        }

        protocol.writeUInt8(0); // end of draw calls

        this.batchedPrograms = {};
    }
}
