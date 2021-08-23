import { Command, InstructorContext, ProtocolReader, ProtocolWriter, RunnerContext } from '../core';
import { VAO, VAORef, Buffer, BufferRef, FIXED_UNIFORMS, Program, ProgramAttributesData, ProgramDefinition, ProgramRef, ProgramUniformData } from '../resources';

export interface RunProgramOptions<P extends ProgramDefinition> {
    program: ProgramRef<P>;
    uniforms: ProgramUniformData<P, number[]>;
    vao: VAORef;
    offset: number;
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
        const {program, vao, offset, count, uniforms} = options;

        context.readyResource(program);

        for (const {buffer} of vao.definition) {
            context.readyResource(buffer);
        }

        context.readyResource(vao);

        protocol.writeUInt32Array([program.id, vao.id, offset, count]);

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
        const [programId, vaoId, offset, count] = protocol.readUInt32Array(4);

        const program = context.getResource(Program, programId);
        const vao = context.getResource(VAO, vaoId);

        if (!program || !vao) {
            return;
        }

        const {uniforms} = program.layout;

        const gl = context.gl;

        gl.bindVertexArray(vao.vao);

        gl.useProgram(program.program);

        setFixedUniforms(context, program);

        for (let i = FIXED_UNIFORMS.length; i < uniforms.length; i++) {
            const {size, dataType} = uniforms[i];
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
    }
});
