import { Protocol } from './protocol';
import { ResourceRef, ResourceState } from './resource';
import { Command, CommandArguments, COMMAND_MAP } from './command';

export enum Instruction {
    STOP,
    RUN_COMMAND,
    MAP_COMMAND,
    UPDATE_RESOURCE,
    LOAD_RESOURCE,
    UNLOAD_RESOURCE
}

export class Instructor {
    private mappedCommands: Record<string, number> = {};

    public resources = new Set<ResourceRef>();

    public constructor(private protocol: Protocol) {
        let index = 0;

        for (const command of Object.values(COMMAND_MAP)) {
            protocol.writeUInt8(Instruction.MAP_COMMAND);
            protocol.writeString(command.name);
            protocol.writeUInt8(index);

            this.mappedCommands[command.name] = index;

            index++;
        }
    }

    public command<C extends Command>(command: C, ... args: CommandArguments<C>) {
        const protocol = this.protocol;

        const fn = command.submit(this, ...args);

        protocol.writeUInt8(Instruction.RUN_COMMAND);

        fn(protocol);
    }

    public loadResource(resource: ResourceRef) {
        const protocol = this.protocol;

        this.resources.add(resource);

        if (resource.state === ResourceState.LOAD_ABORTED) {
            resource.state = ResourceState.LOADING;
        }

        if (resource.state === ResourceState.UNLOADED) {
            resource.state = ResourceState.LOADING;

            const result = resource.load();

            if (result) {
                result.then(() => {
                    if (resource.state === ResourceState.LOAD_ABORTED) {
                        resource.onUnload();
                        resource.state = ResourceState.UNLOADED;
                    } else {
                        resource.state = ResourceState.LOADED;
                    }
                });
                return;
            }

            resource.state = ResourceState.LOADED;
        }

        if (resource.state === ResourceState.LOADED) {
            protocol.writeUInt8(Instruction.LOAD_RESOURCE);
            protocol.writeUInt32(resource.id);
            protocol.writeString(resource.type.name);
            resource.writeData(protocol);

            resource.state = ResourceState.READY;
        }

        if (resource.state === ResourceState.READY && resource.needsUpdate) {
            resource.needsUpdate = false;
            protocol.writeUInt8(Instruction.UPDATE_RESOURCE);
            protocol.writeUInt32(resource.id);
            resource.writeUpdate(protocol);
        }
    }

    public unloadResource(resource: ResourceRef) {
        const protocol = this.protocol;

        if (resource.refcount > 0 || resource.state === ResourceState.UNLOADED) {
            return;
        }

        if (resource.state === ResourceState.READY) {
            protocol.writeUInt8(Instruction.UNLOAD_RESOURCE);
            protocol.writeUInt32(resource.id);
        }

        if (resource.state !== ResourceState.LOADING) {
            resource.onUnload();
        }

        resource.state = ResourceState.UNLOADED;
    }

    public finish() {
        this.protocol.writeUInt8(0);
    }

}
