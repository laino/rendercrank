import {
    Resource,
    ResourceRef,
    ResourceYieldUntil,
    ProtocolReader,
    ProtocolWriter,
    registerResourceType
} from '../core';

import { VAORef } from './vao';
import { BufferRef } from './buffer';

const PREAMBLE = "#version 300 es\nprecision highp float;\n";

function _typeInfo(dataType: GLenum, size: number) {
    return {
        normalize: false,
        dataType,
        size,
        stride: 0
    };
}

export const ATTRIBUTE_TYPE_LAYOUT = {
    'float': _typeInfo(WebGLRenderingContext.FLOAT, 1),
    'vec2': _typeInfo(WebGLRenderingContext.FLOAT, 2),
    'vec3': _typeInfo(WebGLRenderingContext.FLOAT, 3),
    'vec4': _typeInfo(WebGLRenderingContext.FLOAT, 4),
    'mat2': _typeInfo(WebGLRenderingContext.FLOAT, 4),
    'mat3': _typeInfo(WebGLRenderingContext.FLOAT, 9),
    'mat4': _typeInfo(WebGLRenderingContext.FLOAT, 16),
    'int': _typeInfo(WebGLRenderingContext.INT, 1),
    'ivec2': _typeInfo(WebGLRenderingContext.INT, 2),
    'ivec3': _typeInfo(WebGLRenderingContext.INT, 3),
    'ivec4': _typeInfo(WebGLRenderingContext.INT, 4),
    'uint': _typeInfo(WebGLRenderingContext.UNSIGNED_INT, 1),
    'uvec2': _typeInfo(WebGLRenderingContext.UNSIGNED_INT, 2),
    'uvec3': _typeInfo(WebGLRenderingContext.UNSIGNED_INT, 3),
    'uvec4': _typeInfo(WebGLRenderingContext.UNSIGNED_INT, 4),
};

export const UNIFORM_TYPE_LAYOUT = Object.assign({
    'bool': _typeInfo(WebGLRenderingContext.BOOL, 1),
    'bvec2': _typeInfo(WebGLRenderingContext.BOOL, 2),
    'bvec3': _typeInfo(WebGLRenderingContext.BOOL, 3),
    'bvec4': _typeInfo(WebGLRenderingContext.BOOL, 4),
}, ATTRIBUTE_TYPE_LAYOUT);

export type AttributeType = keyof (typeof ATTRIBUTE_TYPE_LAYOUT);
export type UniformType = keyof (typeof UNIFORM_TYPE_LAYOUT);

export interface AttributeDefinition {
    type: AttributeType;
    dataType?: GLenum;
    size?: number;
    stride?: number;
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

export type ProgramAttributesData<P extends ProgramDefinition, T = number[]> =
    Required<Record<keyof P['attributes'], T>>;

export type ProgramUniformData<P extends ProgramDefinition, T = number[]> =
    Required<Record<keyof P['uniforms'], T>>;

export const FIXED_UNIFORMS: UniformLayout = [{
    name: 'u_scale',
    type: 'vec4',
    size: 4,
    dataType: WebGLRenderingContext.FLOAT,
}, {
    name: 'u_translate',
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
                Object.assign({}, ATTRIBUTE_TYPE_LAYOUT[type], {type, name}) :
                Object.assign({}, ATTRIBUTE_TYPE_LAYOUT[type.type], type, {name});
        });

        const uniforms = FIXED_UNIFORMS.concat(Object.entries(def.uniforms).map(([name, type]) => {
            return typeof type === 'string' ?
                Object.assign({}, UNIFORM_TYPE_LAYOUT[type], {type, name}) :
                Object.assign({}, UNIFORM_TYPE_LAYOUT[type.type], type, {name});
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

    public createVAO(buffers: ProgramAttributesData<D, {buffer: BufferRef, offset: number}>) {
        return new VAORef(this.layout.attributes.map(({name, size, stride, dataType, normalize}) => {
            const {offset, buffer} = buffers[name];

            return {
                size,
                stride,
                dataType,
                normalize,
                offset,
                buffer
            };
        }));
    }

    protected loadResource(protocol: ProtocolWriter) {
        protocol.writeString(JSON.stringify(this.layout));
    }
}

export class Program extends Resource {
    static resourceName = 'Program';

    public layout: ProgramLayout;

    public uniformLocations: WebGLUniformLocation[];

    public vertexShader: WebGLShader;
    public fragmentShader: WebGLShader;
    public program: WebGLProgram;

    public *load(protocol: ProtocolReader) {
        const context = this.context;
        const parallelCompileExt = context.khrParallelShaderCompile;
        const gl = context.gl;

        const layout = this.layout = JSON.parse(protocol.readString()) as ProgramLayout;

        const vertexShader = this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        const fragmentShader = this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        const program = this.program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.shaderSource(vertexShader, layout.vertexShader);
        gl.shaderSource(fragmentShader, layout.fragmentShader);

        gl.compileShader(vertexShader);
        gl.compileShader(fragmentShader);

        yield ResourceYieldUntil.LATER; // yield so shaders can be compiled in parallel

        gl.linkProgram(program);

        yield ResourceYieldUntil.LATER; // yield so programs can be compiled in parallel

        if (parallelCompileExt) {
            while (context.streaming && !gl.getProgramParameter(program, parallelCompileExt.COMPLETION_STATUS_KHR)) {
                yield ResourceYieldUntil.BARRIER;
            }
        }

        yield ResourceYieldUntil.FINALIZE; // wait until everyone else has queued their work too

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const message =
                `Program linking failed:\n${gl.getProgramInfoLog(program)}\n` +
                `Vertex shader:\n${gl.getShaderInfoLog(vertexShader)}\n` +
                `Fragment shader:\n${gl.getShaderInfoLog(fragmentShader)}\n\n` +
                `---- VERTEX SHADER ----\n${layout.vertexShader}\n` +
                `---- FRAGMENT SHADER ----\n${layout.fragmentShader}`;

            throw new Error(message);
        }

        this.uniformLocations = layout.uniforms.map(({name}) => gl.getUniformLocation(program, name));
    }

    public update() {
        // noop
    }

    public *unload() {
        yield ResourceYieldUntil.STABLE;

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
        .map((_, i) => `layout(location = ${i}) in ${_.type} ${_.name};`)
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
