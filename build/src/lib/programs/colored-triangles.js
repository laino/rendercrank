import { ProgramRef } from '../resources';
export var ColoredTrianglesProgram = new ProgramRef({
    attributes: {
        color: 'vec4',
        position: 'vec4',
    },
    vertexShader: "\n        out vec4 vColor;\n\n        void main() {\n            vColor = color;\n            gl_Position = position;\n        }\n    ",
    fragmentShader: "\n        in vec4 vColor;\n         \n        out vec4 outColor;\n         \n        void main() {\n          outColor = vColor;\n        }\n    ",
});
//# sourceMappingURL=colored-triangles.js.map