import { Command, COMMAND_MAP } from './command';
import { Resource, ResourceId, RESOURCE_MAP, ResourceYieldUntil } from './resource';
import { Instruction } from './instructor';
import { ProtocolReader } from './protocol';

export interface RunnerContext {
    gl: WebGL2RenderingContext;

    streaming: boolean;

    khrParallelShaderCompile: KHR_parallel_shader_compile;

    width: number;
    height: number;

    getResource<T extends typeof Resource>(type: T, id: ResourceId): InstanceType<T>;
}

export interface CanvasLike {
    width: number;
    height: number;

    getContext(contextId: "webgl2", options?: WebGLContextAttributes): WebGL2RenderingContext | null;
}

export interface RunnerOptions {
    streaming?: boolean;
}

class ResourceOperation {
    public yieldFor: IteratorResult<ResourceYieldUntil>;

    public constructor(
        public resource: Resource,
        public operation: Generator<ResourceYieldUntil>,
        public context: RunnerContext
    ) {
        this.advance();
    }

    public advance(finalize = false): boolean {
        const {yieldFor, resource, context, operation} = this;

        if (yieldFor) {
            if (yieldFor.done) {
                return false;
            }
            
            if (yieldFor.value === ResourceYieldUntil.FINALIZE && !finalize) {
                return false;
            }

            if (yieldFor.value === ResourceYieldUntil.STABLE) {
                if (this.resource.operationsCount !== 0) {
                    return false;
                }

                resource.operationsCount++;
            }
        } else {
            resource.operationsCount++;
        }

        const newYieldFor = operation.next();

        this.yieldFor = newYieldFor;
        
        if (!context.streaming && newYieldFor.value === ResourceYieldUntil.BARRIER) {
            operation.throw(new Error(`Do only yield until barrier in streaming mode (context.streaming)`));
        }

        if (newYieldFor.done || newYieldFor.value === ResourceYieldUntil.STABLE) {
            resource.operationsCount--;
            return false;
        }

        return newYieldFor.value !== ResourceYieldUntil.BARRIER;
    }

    public isCompleted() {
        return this.yieldFor.done;
    }
}

export class CanvasRunner implements RunnerContext {
    public gl: WebGL2RenderingContext;
    public khrParallelShaderCompile: KHR_parallel_shader_compile;

    public width: number;
    public height: number;

    public streaming: boolean;

    private resources = new Map<number, Resource>();
    private resourceOperations = new Set<ResourceOperation>();

    public constructor(
        private canvas: CanvasLike,
        private reader: ProtocolReader,
        options: RunnerOptions = {},
    ) {
        const gl = this.gl = canvas.getContext('webgl2');

        this.streaming = !!options.streaming;

        this.khrParallelShaderCompile = gl.getExtension('KHR_parallel_shader_compile');

        this.resize(canvas.width, canvas.height);
    }

    public getResource<T extends typeof Resource>(type: T, id: ResourceId) {
        const resource = this.resources.get(id);
        
        if (!resource || resource.operationsCount !== 0) {
            return null;
        }

        if (!(resource instanceof type)) {
            throw new Error(`Resource has incorrect type!`);
        }

        return resource as InstanceType<T>;
    }

    public resize(width: number, height: number) {
        const canvas = this.canvas;
        const gl = this.gl;

        canvas.width = width;
        canvas.height = height;

        this.width = canvas.width;
        this.height = canvas.height;

        gl.viewport(0, 0, width, height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    public next() {
        const resources = this.resources;
        const reader = this.reader;

        const commandMap: Command[] = Array(256);

        let action: number;

        while ((action = reader.readUInt8()) !== Instruction.STOP) {
            if (action === Instruction.RUN_COMMAND) {
                const id = reader.readUInt8();

                commandMap[id].render(reader, this);

                continue;
            }

            if (action === Instruction.MAP_COMMAND) {
                const id = reader.readUInt8();
                const commandName = reader.readString();

                const command = COMMAND_MAP[commandName];

                if (!command) {
                    throw new Error(`Command ${commandName} not registered`);
                }

                commandMap[id] = command;

                continue;
            }

            if (action === Instruction.UPDATE_RESOURCE) {
                this.updateResource(reader);

                continue;
            }

            if (action === Instruction.LOAD_RESOURCE) {
                this.loadResource(reader);

                continue;
            }

            if (action === Instruction.UNLOAD_RESOURCE) {
                this.unloadResource(reader);

                continue;
            }
            
            if (action === Instruction.BARRIER) {
                this.advanceResourceOperations();

                continue;
            }

            if (action === Instruction.ADVANCE) {
                reader.advance();
                continue;
            }
        }
    }

    private advanceResourceOperations() {
        const {resourceOperations} = this;

        let hasWork: boolean;
        let finalize = false;

        while (resourceOperations.size > 0) {
            do {
                hasWork = false;

                for (const operation of resourceOperations) {
                    if (operation.advance(finalize)) {
                        hasWork = true;
                    }

                    if (operation.isCompleted()) {
                        resourceOperations.delete(operation);
                    }
                }
            } while (hasWork);

            if (this.streaming && finalize) {
                break;
            }

            finalize = true;
        }
    }
    
    private handleResourceOperation(resource: Resource, operation: Generator<ResourceYieldUntil>) {
        const rop = new ResourceOperation(resource, operation, this);

        if (!rop.isCompleted()) {
            this.resourceOperations.add(rop);
        }
    }

    private loadResource(reader: ProtocolReader) {
        const id = reader.readUInt32();
        const name = reader.readString();

        const resource = new RESOURCE_MAP[name](this);

        this.resources.set(id, resource);
        
        const operation = resource.load(reader);

        if (operation) {
            this.handleResourceOperation(resource, operation);
        }
    }

    private updateResource(reader: ProtocolReader) {
        const id = reader.readUInt32();

        const resource = this.resources.get(id);

        const operation = resource.update(reader);

        if (operation) {
            this.handleResourceOperation(resource, operation);
        }
    }
    
    private unloadResource(reader: ProtocolReader) {
        const id = reader.readUInt32();

        const resource = this.resources.get(id);

        this.resources.delete(id);

        const operation = resource.unload(reader);

        if (operation) {
            this.handleResourceOperation(resource, operation);
        }
    }
}
