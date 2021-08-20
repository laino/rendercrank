import { Command } from '../core';
import { ProgramRef, BufferRef } from '../resources';
export interface RunProgramOptions {
    program: ProgramRef;
    buffer: BufferRef;
    offset: number;
    length: number;
}
export declare const RunProgram: Command<[options: RunProgramOptions]>;
