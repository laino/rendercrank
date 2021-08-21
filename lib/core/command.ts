import { RunnerContext } from './runner';
import { ProtocolReader, ProtocolWriter } from './protocol';
import { InstructorContext } from './instructor';

export const COMMAND_MAP: Record<string, Command> = {};

export interface Command<A extends unknown[] = unknown[]> {
    name: string;

    submit(protocol: ProtocolWriter, context: InstructorContext, ... args: A): void;

    render(protocol: ProtocolReader, context: RunnerContext);
}

export function Command<A extends unknown[]>(def: Command<A>): Command<A> {
    if (Object.prototype.hasOwnProperty.call(COMMAND_MAP, def.name)) {
        throw new Error(`A command with the name ${def.name} is already registered.`);
    }

    COMMAND_MAP[def.name] = def;

    return def;
}
