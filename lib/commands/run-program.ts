import { ProtocolWriter, ProtocolReader, Renderer, Command, Instructor } from '../core';
import { ProgramRef, BufferRef, Program, Buffer } from '../resources';

export interface RunProgramOptions {
    program: ProgramRef,
    buffer: BufferRef,
    offset: number,
    length: number
}

export const RunProgram = Command({
    name: 'RunProgram',

    submit(instructor: Instructor, protocol: ProtocolWriter, options: RunProgramOptions) {
        const {program, buffer, offset, length} = options;

        instructor.loadResource(program);
        instructor.loadResource(buffer);

        protocol.writeUInt32Array([program.id, buffer.id, offset, length]);
    },

    render(protocol: ProtocolReader, renderer: Renderer) {
        const [
            programId,
            bufferId,
            offset,
            length
        ] = protocol.readUInt32Array(4);

        const program = renderer.getResource(programId, Program);
        const buffer = renderer.getResource(bufferId, Buffer);

        console.log(program, buffer);

        if (!program || !buffer) {
            return;
        }
    }
});
