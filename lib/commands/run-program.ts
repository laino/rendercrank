import { ProtocolWriter, ProtocolReader, Renderer, Command, Instructor } from '../core';
import { ProgramRef, ProgramDefinition, BufferRef, Program, Buffer } from '../resources';

type ProgramAttributesData<P extends ProgramDefinition, T = number[]> =
    Required<Record<keyof P['attributes'], T>>;

export interface RunProgramOptions<P extends ProgramDefinition> {
    program: ProgramRef<P>;
    attributes: ProgramAttributesData<P, {buffer: BufferRef, byteOffset: number}>;
    count: number;
}

function isIntegerType(type: GLenum) {
    return type === WebGLRenderingContext.INT ||
           type === WebGLRenderingContext.UNSIGNED_INT
}

export const RunProgram = Command({
    name: 'RunProgram',

    submit<P extends ProgramDefinition>(
        instructor: Instructor,
        protocol: ProtocolWriter,
        options: RunProgramOptions<P>
    ) {
        const {program, attributes, count} = options;

        instructor.loadResource(program);

        const data = [program.id, count];

        for (const {name} of program.layout.attributes) {
            const {buffer, byteOffset} = attributes[name];
            instructor.loadResource(buffer);
            data.push(buffer.id, byteOffset);
        }

        protocol.writeUInt32Array(data);
    },

    render(protocol: ProtocolReader, renderer: Renderer) {
        const programId = protocol.readUInt32();
        const count = protocol.readUInt32();

        const program = renderer.getResource(programId, Program);

        if (!program) {
            return;
        }

        const {attributes, uniforms} = program.layout;

        const attributeDataLength = attributes.length * 2;
        const uniformDataLength = uniforms.length * 2;

        const dataLength = attributeDataLength + uniformDataLength;

        const data = protocol.readUInt32Array(dataLength);

        const buffers: {buffer: Buffer, offset: number}[] = [];

        for (let i = 0; i < attributeDataLength; i += 2) {
            const bufferId = data[i];
            const offset = data[i + 1];

            const buffer = renderer.getResource(bufferId, Buffer);

            if (!buffer) {
                return;
            }

            buffers.push({buffer, offset});
        }

        const gl = renderer.gl;

        const vao = gl.createVertexArray();

        gl.bindVertexArray(vao);

        for (let i = 0; i < attributes.length; i++) {
            const {buffer, offset} = buffers[i];
            const {size, dataType} = attributes[i];
            const location = program.attributeLocations[i];

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
            gl.enableVertexAttribArray(location);

            if (isIntegerType(dataType)) {
                gl.vertexAttribIPointer(location, size, dataType, 0, offset);
            }

            gl.vertexAttribPointer(location, size, dataType, false, 0, offset);
        }

        gl.useProgram(program.program);
        gl.drawArrays(gl.TRIANGLES, 0, count);
    }
});
