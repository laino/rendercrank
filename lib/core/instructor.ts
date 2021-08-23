import { ProtocolWriter } from './protocol';
import { ResourceRef, ResourceRefState } from './resource';
import { Command, COMMAND_MAP } from './command';

export enum Instruction {
    STOP,
    RUN_COMMAND,
    MAP_COMMAND,
    UPDATE_RESOURCE,
    LOAD_RESOURCE,
    UNLOAD_RESOURCE,
    ADVANCE,
    BARRIER,
}

export interface InstructorContext {
    readyResource(resource: ResourceRef);
}

export class Instructor implements InstructorContext {
    private mappedCommands: Record<string, number> = {};
    private commandProtocol: ProtocolWriter;

    private loadingResources = new Set<ResourceRef>();

    public constructor(private protocol: ProtocolWriter) {
    }

    public writeCommandMap() {
        const protocol = this.protocol;

        let index = 0;

        for (const command of Object.values(COMMAND_MAP)) {
            protocol.writeUInt8(Instruction.MAP_COMMAND);
            protocol.writeUInt8(index);
            protocol.writeString(command.name);

            this.mappedCommands[command.name] = index;

            index++;
        }

        this.commandProtocol = protocol.createWriter();
    }

    public command<C extends Command>(command: C, ... args: C extends Command<infer A> ? A : never) {
        const commandProtocol = this.commandProtocol;

        commandProtocol.writeUInt8(Instruction.RUN_COMMAND);
        commandProtocol.writeUInt8(this.mappedCommands[command.name]);

        command.submit(commandProtocol, this, ...args);
    }

    public async waitForResources() {
        for (const resource of this.loadingResources) {
            await resource.load();
            this.readyResource(resource);
        }

        this.loadingResources.clear();
    }

    public finish() {
        const commandProtocol = this.commandProtocol;
        const protocol = this.protocol;

        commandProtocol.writeUInt8(Instruction.STOP);
        protocol.writeUInt8(Instruction.BARRIER);
        protocol.writeUInt8(Instruction.ADVANCE);
        protocol.advance();

        for (const data of commandProtocol.flush()) {
            protocol.passData(data);
        }

        this.loadingResources.clear();
    }

    public readyResource(resource: ResourceRef) {
        const protocol = this.protocol;

        resource.load();

        if (resource.state === ResourceRefState.LOADED) {
            protocol.writeUInt8(Instruction.LOAD_RESOURCE);
            protocol.writeUInt32(resource.id);
            protocol.writeString(resource.type.resourceName);
            resource.ready(protocol);
        } else if (resource.state === ResourceRefState.LOADING) {
            this.loadingResources.add(resource);
            return;
        }

        if (resource.state === ResourceRefState.READY && resource.needsUpdate) {
            protocol.writeUInt8(Instruction.UPDATE_RESOURCE);
            protocol.writeUInt32(resource.id);
            resource.update(protocol);
        }
    }

    public unloadResource(resource: ResourceRef) {
        const protocol = this.protocol;

        if (resource.refcount > 0) {
            return;
        }

        if (resource.state === ResourceRefState.READY) {
            protocol.writeUInt8(Instruction.UNLOAD_RESOURCE);
            protocol.writeUInt32(resource.id);
            resource.unready(protocol);
        }

        if (resource.state === ResourceRefState.LOADED) {
            resource.unload();
        }
    }

}
