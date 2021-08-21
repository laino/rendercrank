import { ProtocolWriter, ProtocolReader, RunnerContext, Command, InstructorContext } from '../core';
import { ProgramRef, ProgramDefinition, BufferRef, Program, Buffer, FIXED_UNIFORMS } from '../resources';

type ProgramAttributesData<P extends ProgramDefinition, T = number[]> =
    Required<Record<keyof P['attributes'], T>>;

type ProgramUniformData<P extends ProgramDefinition, T = number[]> =
    Required<Record<keyof P['uniforms'], T>>;

export interface RunProgramOptions<P extends ProgramDefinition> {
    program: ProgramRef<P>;
    attributes: ProgramAttributesData<P, {buffer: BufferRef, byteOffset: number}>;
    uniforms: ProgramUniformData<P, number[]>;
    count: number;
}

function isIntegerType(type: GLenum) {
    return type === WebGLRenderingContext.INT ||
           type === WebGLRenderingContext.UNSIGNED_INT;
}

function setFixedUniforms(context: RunnerContext, program: Program) {
    const gl = context.gl;

    gl.uniform4f(program.uniformLocations[0], context.width, -context.height, 1, 1);
    gl.uniform4f(program.uniformLocations[1], -1, 1, 0, 0);
}

export const RunProgram = Command({
    name: 'RunProgram',

    submit<P extends ProgramDefinition>(
        protocol: ProtocolWriter,
        context: InstructorContext,
        options: RunProgramOptions<P>
    ) {
        const {program, attributes, count, uniforms} = options;

        context.loadResource(program);

        const data = [program.id, count];

        const attributeLayout = program.layout.attributes;

        for (const {name} of attributeLayout) {
            const {buffer, byteOffset} = attributes[name];
            context.loadResource(buffer);
            data.push(buffer.id, byteOffset);
        }

        protocol.writeUInt32Array(data);

        const uniformLayout = program.layout.uniforms;

        for (let i = FIXED_UNIFORMS.length; i < uniformLayout.length; i++) {
            const {name, dataType, size} = uniformLayout[i];
            const data = uniforms[name];

            if (size !== data.length) {
                throw new Error(`Uniform ${name} is of size ${size} but ${data.length} elements.`);
            }

            if (dataType === WebGLRenderingContext.FLOAT) {
                protocol.writeFloat32Array(data);
            } else if (dataType === WebGLRenderingContext.INT) {
                protocol.writeInt32Array(data);
            } else if (dataType === WebGLRenderingContext.UNSIGNED_INT) {
                protocol.writeUInt32Array(data);
            }
        }
    },

    render(protocol: ProtocolReader, context: RunnerContext) {
        const programId = protocol.readUInt32();
        const count = protocol.readUInt32();

        const program = context.getResource(programId, Program);

        if (!program) {
            return;
        }

        const {attributes, uniforms} = program.layout;

        const gl = context.gl;

        const attributeDataLength = attributes.length * 2;

        const data = protocol.readUInt32Array(attributeDataLength);

        const buffers: {buffer: Buffer, offset: number}[] = [];

        for (let i = 0; i < attributeDataLength; i += 2) {
            const bufferId = data[i];
            const offset = data[i + 1];

            const buffer = context.getResource(bufferId, Buffer);

            if (!buffer) {
                return;
            }

            buffers.push({buffer, offset});
        }

        const vao = gl.createVertexArray();

        gl.bindVertexArray(vao);

        for (let i = 0; i < attributes.length; i++) {
            const {buffer, offset} = buffers[i];
            const {size, dataType, normalize} = attributes[i];
            const location = program.attributeLocations[i];

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
            gl.enableVertexAttribArray(location);

            if (isIntegerType(dataType)) {
                gl.vertexAttribIPointer(location, size, dataType, 0, offset);
            } else {
                gl.vertexAttribPointer(location, size, dataType, normalize, 0, offset);
            }
        }

        gl.useProgram(program.program);

        setFixedUniforms(context, program);

        for (let i = FIXED_UNIFORMS.length; i < uniforms.length; i++) {
            const {size, dataType} = attributes[i];
            const location = program.uniformLocations[i];

            if (dataType === WebGLRenderingContext.FLOAT) {
                gl[`uniform${size}f`](location, ... protocol.readFloat32Array(size));
            } else if (dataType === WebGLRenderingContext.INT) {
                gl[`uniform${size}i`](location, ... protocol.readInt32Array(size));
            } else if (dataType === WebGLRenderingContext.UNSIGNED_INT) {
                gl[`uniform${size}iu`](location, ... protocol.readUInt32Array(size));
            }
        }

        gl.drawArrays(gl.TRIANGLES, 0, count);

        gl.deleteVertexArray(vao);
    }
});
