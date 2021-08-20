import { ProgramRef } from '../resources';

export const ColoredTrianglesProgram = new ProgramRef({
    attributes: {
        color: 'vec4',
        position: 'vec4',
    },
    uniforms: {},
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
