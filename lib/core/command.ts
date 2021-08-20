import { Renderer } from './renderer';
import { Protocol } from './protocol';
import { Instructor } from './instructor';

export const COMMAND_MAP: Record<string, Command> = {};

export type CommandArguments<C extends Command> =
    C extends { submit(instructor: Instructor, ... args: infer A): (protocol: Protocol) => void  } ? A : never;

export interface Command {
    name: string;

    submit(instructor: Instructor, ... args: any[]): (protocol: Protocol) => void;

    render(protocol: Protocol, renderer: Renderer);
}

export function registerCommand(command: Command) {
    if (Object.prototype.hasOwnProperty.call(COMMAND_MAP, command.name)) {
        throw new Error(`A command with the name ${command.name} is already registered.`);
    }

    COMMAND_MAP[command.name] = command;
}
