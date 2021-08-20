import { Resource, ResourceRef, ProtocolReader, ProtocolWriter } from '../core';

const PREAMBLE = "#version 300 es\nprecision highp float;\n";

export type AttributeType =
    'float' |
    'vec2' |
    'vec3' |
    'vec4' |
    'mat2' |
    'mat3' |
    'mat4' |
    'int' |
    'ivec2' |
    'ivec3' |
    'ivec4' |
    'uint' |
    'uvec2' |
    'uvec3' |
    'uvec4';

export type UniformType =
    AttributeType |
    'bool' |
    'bvec2' |
    'bvec3' |
    'bvec4';

export type AttributeMap = Record<string, AttributeType>;
export type UniformMap = Record<string, UniformType>;

export interface ProgramDefinition {
    vertexShader?: string,
    fragmentShader?: string,

    attributes?: AttributeMap;
    uniforms?: UniformMap;
}

interface Attribute {
    name: string,
    type: AttributeType,
    location: number
}

interface Uniform {
    name: string,
    type: UniformType,
    location: WebGLUniformLocation
}

export class ProgramRef extends ResourceRef {
    public constructor(private def: ProgramDefinition) {
        super(Program);
    }

    public writeData(protocol: ProtocolWriter) {
        protocol.writeString(JSON.stringify(this.def));
    }
}

export class Program extends Resource {
    static resourceName = 'Program';

    private attributes: Attribute[];
    private uniforms: Uniform[];

    private vertexShader: WebGLShader;
    private fragmentShader: WebGLShader;
    private program: WebGLProgram;

    public load(protocol: ProtocolReader) {
        const def: ProgramDefinition = JSON.parse(protocol.readString());

        const gl = this.renderer.gl;

        const attributes = def.attributes || {};
        const uniforms = def.uniforms || {};

        const vertexShaderSource = createVertexShaderCode(def.vertexShader, attributes, uniforms);
        const fragmentShaderSource = createFragmentShaderCode(def.fragmentShader, uniforms);

        const vertexShader = this.vertexShader = gl.createShader(gl.VERTEX_SHADER);

        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(vertexShader));
        }

        const fragmentShader = this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(fragmentShader));
        }

        const program = this.program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program));
        }

        this.attributes = Object.entries(attributes).map(([name, type]) => {
            return {
                name,
                type,
                location: gl.getAttribLocation(program, name)
            };
        });

        this.uniforms = Object.entries(uniforms).map(([name, type]) => {
            return {
                name,
                type,
                location: gl.getUniformLocation(program, name)
            };
        });
    }

    public update() {
        // noop
    }

    public unload() {
        const gl = this.renderer.gl;

        gl.deleteProgram(this.program);
        gl.deleteShader(this.vertexShader);
        gl.deleteShader(this.fragmentShader);

        this.program = void 0;
        this.vertexShader = void 0;
        this.fragmentShader = void 0;
    }
}

function createVertexShaderCode(body: string, attributes: AttributeMap, uniforms: UniformMap) {
    return (
        PREAMBLE +
        createAttributes(attributes) +
        createUniforms(uniforms) +
        fixIndent(body)
    );
}

function createFragmentShaderCode(body: string, uniforms: UniformMap) {
    return (
        PREAMBLE +
        createUniforms(uniforms) +
        fixIndent(body)
    );
}

function createAttributes(attributes: AttributeMap) {
    return Object.entries(attributes)
        .map(_ => `in ${_[1]} ${_[0]};`)
        .join('\n') + '\n';
}

function createUniforms(uniforms: UniformMap) {
    return Object.entries(uniforms)
        .map(_ => `uniform ${_[1]} ${_[0]};`)
        .join('\n') + '\n';
}

const firstCharRegExp = /[^ \t]/;
function fixIndent(body: string) {
    const lines = body.split('\n');

    let minIndent = Infinity;

    for (const line of lines) {
        const match = line.match(firstCharRegExp);
        const lineStart = match ? match.index : line.length;

        minIndent = Math.min(minIndent, lineStart);
    }

    return lines.map((line) => {
        return line.slice(minIndent);
    }).join('\n');
}
