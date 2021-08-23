import { ProtocolWriter, ProtocolReader, registerResourceType, Resource, ResourceId, ResourceRef, InstructorContext } from '../core';
import { Buffer, BufferRef } from './buffer';

interface VAOEntry {
    buffer: BufferRef;
    offset: number;
    dataType: GLenum;
    size: number;
    stride: number;
    normalize: boolean;
}

export type VAODefinition = VAOEntry[];

export class VAORef extends ResourceRef {
    public definition: VAODefinition;

    public constructor(def: VAODefinition) {
        super(VAO);

        this.setDefinition(def);
    }

    public setDefinition(def: VAODefinition) {
        this.definition = def;

        this.needsUpdate = true;
    }

    public updateResource(protocol: ProtocolWriter) {
        protocol.writeUInt32(this.definition.length);

        for (const entry of this.definition) {
            protocol.writeUInt32Array([
                entry.buffer.id,
                entry.offset,
                entry.dataType,
                entry.size,
                entry.stride,
                entry.normalize ? 1 : 0
            ]);
        }
    }
}

function isIntegerType(type: GLenum) {
    return type === WebGLRenderingContext.INT ||
           type === WebGLRenderingContext.UNSIGNED_INT;
}

export class VAO extends Resource {
    static resourceName = 'VAO';

    public vao: WebGLVertexArrayObject;

    public load() {
        this.vao = this.context.gl.createVertexArray();
    }

    public update(protocol: ProtocolReader) {
        const context = this.context;
        const gl = context.gl;

        const attributeCount = protocol.readUInt32();

        const data = protocol.readUInt32Array(attributeCount * 6);

        gl.bindVertexArray(this.vao);

        for (let i = 0; i < attributeCount; i++) {
            const dataOffset = i * 6;
            const bufferId: ResourceId = data[dataOffset];
            const offset = data[dataOffset + 1];
            const dataType: GLenum = data[dataOffset + 2];
            const size = data[dataOffset + 3];
            const stride = data[dataOffset + 4];
            const normalize = !!data[dataOffset + 5];

            const buffer = context.getResource(Buffer, bufferId);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
            gl.enableVertexAttribArray(i);

            if (isIntegerType(dataType)) {
                gl.vertexAttribIPointer(i, size, dataType, stride, offset);
            } else {
                gl.vertexAttribPointer(i, size, dataType, normalize, stride, offset);
            }
        }
    }

    public unload() {
        this.context.gl.deleteVertexArray(this.vao);
        this.vao = null;
    }
}

registerResourceType(VAO);

