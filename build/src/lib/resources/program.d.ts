import { Resource, ResourceRef, ProtocolReader, ProtocolWriter } from '../core';
export declare type AttributeType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat2' | 'mat3' | 'mat4' | 'int' | 'ivec2' | 'ivec3' | 'ivec4' | 'uint' | 'uvec2' | 'uvec3' | 'uvec4';
export declare type UniformType = AttributeType | 'bool' | 'bvec2' | 'bvec3' | 'bvec4';
export declare type AttributeMap = Record<string, AttributeType>;
export declare type UniformMap = Record<string, UniformType>;
export interface ProgramDefinition {
    vertexShader?: string;
    fragmentShader?: string;
    attributes?: AttributeMap;
    uniforms?: UniformMap;
}
export declare class ProgramRef extends ResourceRef {
    private def;
    constructor(def: ProgramDefinition);
    writeData(protocol: ProtocolWriter): void;
}
export declare class Program extends Resource {
    static resourceName: string;
    private attributes;
    private uniforms;
    private vertexShader;
    private fragmentShader;
    private program;
    load(protocol: ProtocolReader): void;
    update(): void;
    unload(): void;
}
