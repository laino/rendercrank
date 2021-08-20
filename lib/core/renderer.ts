import { Command, COMMAND_MAP } from './command';
import { Resource, ResourceID, RESOURCE_MAP } from './resource';
import { Instruction } from './instructor';
import { ProtocolReader } from './protocol';

const DEBUG = true;

export interface Renderer {
    gl: WebGL2RenderingContext;

    getResource<T extends typeof Resource>(id: ResourceID, type: T): InstanceType<T>;

    render(protocol: ProtocolReader);
}

export class CanvasRenderer implements Renderer {
    public gl: WebGL2RenderingContext;

    private resources = new Map<number, Resource>();

    public constructor(public canvas: HTMLCanvasElement) {
        this.gl = canvas.getContext('webgl2');
    }

    public getResource<T extends typeof Resource>(id: ResourceID, type: T) {
        const resource = this.resources.get(id);

        if (!resource) {
            return null;
        }

        if (DEBUG) {
            if (!(resource instanceof type)) {
                throw new Error(`Resource has incorrect type!`);
            }
        }

        return resource as InstanceType<T>;
    }

    public render(protocol: ProtocolReader) {
        const resources = this.resources;

        const commandMap: Command[] = Array(256);

        let action: number;
        while ((action = protocol.readUInt8()) !== Instruction.STOP) {
            if (action === Instruction.RUN_COMMAND) {
                const id = protocol.readUInt8();

                commandMap[id].render(protocol, this);

                continue;
            }

            if (action === Instruction.MAP_COMMAND) {
                const commandName = protocol.readString();
                const id = protocol.readUInt8();

                const command = COMMAND_MAP[commandName];

                if (!command) {
                    throw new Error(`Command ${commandName} not registered`);
                }

                commandMap[id] = command;

                continue;
            }

            if (action === Instruction.UPDATE_RESOURCE) {
                const id = protocol.readUInt32();

                const resource = this.resources.get(id);

                resource.update(protocol);

                continue;
            }

            if (action === Instruction.LOAD_RESOURCE) {
                const id = protocol.readUInt32();
                const name = protocol.readString();

                const resource: Resource = new (RESOURCE_MAP[name] as any)(this);

                resources.set(id, resource);

                resource.load(protocol);

                continue;
            }

            if (action === Instruction.UNLOAD_RESOURCE) {
                const id = protocol.readUInt32();

                const resource = this.resources.get(id);

                resource.unload();

                this.resources.delete(id);

                continue;
            }

            if (action === Instruction.ADVANCE) {
                protocol.advance();
                continue;
            }
        }
    }
}
