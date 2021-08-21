import { Command, COMMAND_MAP } from './command';
import { Resource, ResourceID, RESOURCE_MAP } from './resource';
import { Instruction } from './instructor';
import { ProtocolReader } from './protocol';

export interface RunnerContext {
    gl: WebGL2RenderingContext;

    width: number;
    height: number;

    getResource<T extends typeof Resource>(id: ResourceID, type: T): InstanceType<T>;
}

export interface CanvasLike {
    width: number;
    height: number;

    getContext(contextId: "webgl2", options?: WebGLContextAttributes): WebGL2RenderingContext | null;
}

export class CanvasRunner implements RunnerContext {
    public gl: WebGL2RenderingContext;

    public width: number;
    public height: number;

    private resources = new Map<number, Resource>();

    public constructor(private canvas: CanvasLike, private reader: ProtocolReader) {
        this.gl = canvas.getContext('webgl2');

        this.resize(canvas.width, canvas.height);
    }

    public getResource<T extends typeof Resource>(id: ResourceID, type: T) {
        const resource = this.resources.get(id);

        if (!resource) {
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
                const id = reader.readUInt32();

                const resource = this.resources.get(id);

                resource.update(reader);

                continue;
            }

            if (action === Instruction.LOAD_RESOURCE) {
                const id = reader.readUInt32();
                const name = reader.readString();

                const resource = new RESOURCE_MAP[name](this);

                resources.set(id, resource);

                resource.load(reader);

                continue;
            }

            if (action === Instruction.UNLOAD_RESOURCE) {
                const id = reader.readUInt32();

                const resource = this.resources.get(id);

                resource.unload();

                this.resources.delete(id);

                continue;
            }

            if (action === Instruction.ADVANCE) {
                reader.advance();
                continue;
            }
        }
    }
}
