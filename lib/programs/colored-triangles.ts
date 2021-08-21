import { ProgramRef } from '../resources';

export const ColoredTrianglesProgram = new ProgramRef({
    attributes: {
        color: {
            type: 'vec4',
            size: 3
        },
        position: {
            type: 'vec4',
            size: 3
        }
    },
    uniforms: {},
    vertexShader: `
        out vec4 vColor;

        void main() {
            vColor = color;
            gl_Position = (position / u_scale) + u_translate;
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
