import { Instructor } from './core';
import { RenderContext } from './render-context';

import { ProgramRef } from './resources';
import { RunProgram } from './commands';

export const ColoredTrianglesProgram = new ProgramRef({
    attributes: {
        color: 'vec4',
        position: 'vec4',
    },
    vertexShader: `
        out vec4 vColor;

        void main() {
            vColor = color;
            gl_Position = position;
        }
    `,
    fragmentShader: `
        in vec4 vColor;
         
        out vec4 outColor;
         
        void main() {
          outColor = vColor;
        }
    `,
});

export class RenderTarget {
    public zIndex = 0;

    private drawCallBatcher = new DrawCallBatcher();

    public constructor(private context: RenderContext) {
    }

    public submit(instructor: Instructor) {
        this.drawCallBatcher.submit(instructor);
    }

    public rect(x: number, y: number, width: number, height: number) {
        const z = this.zIndex++;

        this.triangles([
            x,         y         , z,
            x + width, y         , z,
            x + width, y + height, z,
            x,         y         , z,
            x + width, y + height, z,
            x        , y + height, z,
        ]);
    }

    public triangles(data: number[]) {
        this.drawCallBatcher.drawTriangles(this.context, ColoredTrianglesProgram, data);
    }

}

interface ProgramCall {
    context: RenderContext,
    program: ProgramRef,
    triangles: number[][],
    trianglesLength: number
}

export class DrawCallBatcher {
    private programs: Record<string, ProgramCall> = {};
    private batchedPrograms: number[][] = [];

    public drawTriangles(context: RenderContext, program: ProgramRef, data: number[]) {
        const ID = `${context.id}:${program.id}`;

        const batch = this.programs[ID];

        if (!batch) {
            this.programs[ID] = {
                context,
                program,
                triangles: [data],
                trianglesLength: data.length
            };

            return;
        }

        batch.triangles.push(data);
        batch.trianglesLength += data.length;
    }

    public submit(instructor: Instructor) {
        for (const {context, program, triangles, trianglesLength} of Object.values(this.programs)) {
            const {
                buffer,
                byteOffset,
            } = context.float32BufferPool.writeMultiData(triangles, trianglesLength);

            instructor.command(RunProgram, program, buffer, byteOffset, trianglesLength);
        }
    }
}
