import { ProtocolWriter, ProtocolReader, Renderer, Command, Instructor } from '../core';
import { ProgramRef, ProgramDefinition, BufferRef, Program, Buffer } from '../resources';

export type DefinitionOfProgram<P> = P extends ProgramRef ? P['def'] : never;
export type ProgramAttributesData<P extends ProgramDefinition, T = number[]> =
    Required<Record<keyof P['attributes'], T>>;

export interface RunProgramOptions<P extends ProgramDefinition> {
    program: ProgramRef<P>;
    attributes: ProgramAttributesData<P, {buffer: BufferRef, offset: number}>;
    attributeLength: number;
}

export const RunProgram = Command({
    name: 'RunProgram',

    submit<P extends ProgramRef>(
            instructor: Instructor,
            protocol: ProtocolWriter,
            options: RunProgramOptions<DefinitionOfProgram<P>>) {

        const {program, attributes, attributeLength} = options;

        instructor.loadResource(program);

        const data = [program.id, attributeLength];

        for (const attributeName of program.def.attributeOrder) {
            const {buffer, offset} = attributes[attributeName];
            instructor.loadResource(buffer);
            data.push(buffer.id, offset);
        }

        protocol.writeUInt32Array(data);
    },

    render(protocol: ProtocolReader, renderer: Renderer) {
        const programId = protocol.readUInt32();
        const attributeLength = protocol.readUInt32();

        console.log(programId, attributeLength);

        const program = renderer.getResource(programId, Program);

        if (!program) {
            return;
        }

        const {attributeOrder, uniformOrder} = program.def;

        const dataLength = (attributeOrder.length + uniformOrder.length) * 2;

        const data = protocol.readUInt32Array(dataLength);

        let i = 0;

        for (const attributeName of attributeOrder) {
            const bufferId = data[i];
            const offset = data[i + 1];

            const buffer = renderer.getResource(bufferId, Buffer);

            console.log(attributeName, bufferId, offset, buffer);

            if (!buffer) {
                return;
            }

            i += 2;
        }
    }
});
