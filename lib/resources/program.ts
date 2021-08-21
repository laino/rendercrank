import {
    Resource,
    ResourceRef,
    ProtocolReader,
    ProtocolWriter,
    registerResourceType
} from '../core';

const PREAMBLE = "#version 300 es\nprecision highp float;\n";

function AttrTypeInfo(dataType: GLenum, size: number) {
    return {
        normalize: false,
        dataType,
        size,
    };
}

export const AttributeTypeLayout = {
    'float': AttrTypeInfo(WebGLRenderingContext.FLOAT, 1),
    'vec2': AttrTypeInfo(WebGLRenderingContext.FLOAT, 2),
    'vec3': AttrTypeInfo(WebGLRenderingContext.FLOAT, 3),
    'vec4': AttrTypeInfo(WebGLRenderingContext.FLOAT, 4),
    'mat2': AttrTypeInfo(WebGLRenderingContext.FLOAT, 4),
    'mat3': AttrTypeInfo(WebGLRenderingContext.FLOAT, 9),
    'mat4': AttrTypeInfo(WebGLRenderingContext.FLOAT, 16),
    'int': AttrTypeInfo(WebGLRenderingContext.INT, 1),
    'ivec2': AttrTypeInfo(WebGLRenderingContext.INT, 2),
    'ivec3': AttrTypeInfo(WebGLRenderingContext.INT, 3),
    'ivec4': AttrTypeInfo(WebGLRenderingContext.INT, 4),
    'uint': AttrTypeInfo(WebGLRenderingContext.UNSIGNED_INT, 1),
    'uvec2': AttrTypeInfo(WebGLRenderingContext.UNSIGNED_INT, 2),
    'uvec3': AttrTypeInfo(WebGLRenderingContext.UNSIGNED_INT, 3),
    'uvec4': AttrTypeInfo(WebGLRenderingContext.UNSIGNED_INT, 4),
};

export const UniformTypeLayout = Object.assign({
    'bool': AttrTypeInfo(WebGLRenderingContext.BOOL, 1),
    'bvec2': AttrTypeInfo(WebGLRenderingContext.BOOL, 2),
    'bvec3': AttrTypeInfo(WebGLRenderingContext.BOOL, 3),
    'bvec4': AttrTypeInfo(WebGLRenderingContext.BOOL, 4),
}, AttributeTypeLayout);

export type AttributeType = keyof (typeof AttributeTypeLayout);
export type UniformType = keyof (typeof UniformTypeLayout);

export interface AttributeDefinition {
    type: AttributeType;
    dataType?: GLenum;
    size?: number;
    normalize?: boolean;
}

export interface UniformDefinition {
    type: UniformType;
    dataType?: GLenum;
    size?: number;
}

export interface ProgramDefinition {
    vertexShader: string,
    fragmentShader: string,

    attributes: Record<string, AttributeType | AttributeDefinition>;
    uniforms: Record<string, UniformType | UniformDefinition>;
}

export type AttributeLayout = Required<{name: string} & AttributeDefinition>[];
export type UniformLayout = Required<{name: string} & UniformDefinition>[];

export interface ProgramLayout {
    vertexShader: string;
    fragmentShader: string;

    attributes: AttributeLayout;
    uniforms: UniformLayout;
}

const STANDARD_UNIFORMS: UniformLayout = [{
    name: 'u_resolution',
    type: 'vec4',
    size: 4,
    dataType: WebGLRenderingContext.FLOAT,
}];

export class ProgramRef<D extends ProgramDefinition = ProgramDefinition> extends ResourceRef {
    public layout: ProgramLayout;

    public constructor(def: D) {
        super(Program);

        const attributes = Object.entries(def.attributes).map(([name, type]) => {
            return typeof type === 'string' ?
                Object.assign({}, AttributeTypeLayout[type], {type, name}) :
                Object.assign({}, AttributeTypeLayout[type.type], type, {name});
        });

        const uniforms = STANDARD_UNIFORMS.concat(Object.entries(def.uniforms).map(([name, type]) => {
            return typeof type === 'string' ?
                Object.assign({}, UniformTypeLayout[type], {type, name}) :
                Object.assign({}, UniformTypeLayout[type.type], type, {name});
        }));

        this.layout = Object.assign({}, {
            vertexShader: createVertexShaderCode(def.vertexShader, uniforms, attributes),
            fragmentShader: createFragmentShaderCode(def.fragmentShader, uniforms),

            attributes,
            uniforms,

            attributeOrder: Object.keys(def.attributes),
            uniformOrder: Object.keys(def.uniforms),
        });
    }

    public writeData(protocol: ProtocolWriter) {
        protocol.writeString(JSON.stringify(this.layout));
    }
}

export class Program extends Resource {
    static resourceName = 'Program';

    public layout: ProgramLayout;

    public attributeLocations: number[];
    public uniformLocations: WebGLUniformLocation[];

    public vertexShader: WebGLShader;
    public fragmentShader: WebGLShader;
    public program: WebGLProgram;

    public load(protocol: ProtocolReader) {
        const layout = this.layout = JSON.parse(protocol.readString()) as ProgramLayout;

        const gl = this.context.gl;

        const vertexShader = this.vertexShader = gl.createShader(gl.VERTEX_SHADER);

        gl.shaderSource(vertexShader, layout.vertexShader);
        gl.compileShader(vertexShader);

        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(vertexShader) +
                            `\n ---- VERTEX SHADER ----\n` + layout.vertexShader);
        }

        const fragmentShader = this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(fragmentShader, layout.fragmentShader);
        gl.compileShader(fragmentShader);

        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(fragmentShader) +
                            '\n ---- FRAGMENT SHADER ----\n' + layout.fragmentShader);
        }

        const program = this.program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program));
        }

        this.attributeLocations = layout.attributes.map(({name}) => gl.getAttribLocation(program, name));
        this.uniformLocations = layout.uniforms.map(({name}) => gl.getUniformLocation(program, name));
    }

    public update() {
        // noop
    }

    public unload() {
        const gl = this.context.gl;

        gl.deleteProgram(this.program);
        gl.deleteShader(this.vertexShader);
        gl.deleteShader(this.fragmentShader);

        this.program = void 0;
        this.vertexShader = void 0;
        this.fragmentShader = void 0;
    }
}

function createVertexShaderCode(body: string, uniforms: UniformLayout, attributes: AttributeLayout) {
    return (
        PREAMBLE +
        createUniforms(uniforms) +
        createAttributes(attributes) +
        fixIndent(body)
    );
}

function createFragmentShaderCode(body: string, uniforms: UniformLayout) {
    return (
        PREAMBLE +
        createUniforms(uniforms) +
        fixIndent(body)
    );
}

function createAttributes(attributes: AttributeLayout) {
    return attributes
        .map(_ => `in ${_.type} ${_.name};`)
        .join('\n') + '\n';
}

function createUniforms(uniforms: UniformLayout) {
    return uniforms
        .map(_ => `uniform ${_.type} ${_.name};`)
        .join('\n') + '\n';
}

const firstCharRegExp = /[^ \t]/;
function fixIndent(body: string) {
    const lines = body.split('\n');

    let minIndent = Infinity;

    for (const line of lines) {
        const match = line.match(firstCharRegExp);

        if (match) {
            minIndent = Math.min(minIndent, match.index);
        }
    }

    return lines.map((line) => {
        return line.slice(minIndent);
    }).join('\n');
}

registerResourceType(Program);
