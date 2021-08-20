import { Renderer } from './renderer';
import { ProtocolReader, ProtocolWriter } from './protocol';
import { Instructor } from './instructor';
export declare const COMMAND_MAP: Record<string, Command>;
export interface Command<A extends any[] = any[]> {
    name: string;
    submit(instructor: Instructor, protocol: ProtocolWriter, ...args: A): void;
    render(protocol: ProtocolReader, renderer: Renderer): any;
}
export declare function Command<A extends any[]>(def: Command<A>): Command<A>;
