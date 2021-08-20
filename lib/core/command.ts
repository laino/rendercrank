import { Renderer } from './renderer';
import { ProtocolReader, ProtocolWriter } from './protocol';
import { Instructor } from './instructor';

export const COMMAND_MAP: Record<string, Command> = {};

export interface Command<A extends any[] = any[]> {
    name: string;

    submit(instructor: Instructor, protocol: ProtocolWriter, ... args: A): void;

    render(protocol: ProtocolReader, renderer: Renderer);
}

export function Command<A extends any[]>(def: Command<A>): Command<A> {
    if (Object.prototype.hasOwnProperty.call(COMMAND_MAP, def.name)) {
        throw new Error(`A command with the name ${def.name} is already registered.`);
    }

    return def;
}
