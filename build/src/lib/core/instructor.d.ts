import { ProtocolWriter } from './protocol';
import { ResourceRef } from './resource';
import { Command } from './command';
export declare enum Instruction {
    STOP = 0,
    RUN_COMMAND = 1,
    MAP_COMMAND = 2,
    UPDATE_RESOURCE = 3,
    LOAD_RESOURCE = 4,
    UNLOAD_RESOURCE = 5,
    ADVANCE = 6
}
export declare class Instructor {
    private protocol;
    private mappedCommands;
    resources: Set<ResourceRef>;
    private commandProtocol;
    constructor(protocol: ProtocolWriter);
    command<C extends Command>(command: C, ...args: C extends Command<infer A> ? A : never): void;
    finish(): void;
    loadResource(resource: ResourceRef): void;
    unloadResource(resource: ResourceRef): void;
}
