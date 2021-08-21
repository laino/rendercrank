import { ProtocolReader, ProtocolWriter, Resource, ResourceRef } from '../core';

interface VertexBufferUpdate {
    offset: number,
    length: number,
}

export interface ArrayBufferViewLike extends ArrayBufferView {
    readonly BYTES_PER_ELEMENT: number;
    readonly length: number;

    set(data: ArrayLike<number>, offset: number): void;
}

export interface ArrayBufferViewLikeType {
    readonly BYTES_PER_ELEMENT: number;

    new(buffer: ArrayBufferLike): ArrayBufferViewLike;
    new(length: number): ArrayBufferViewLike;
}

export class BufferRef extends ResourceRef {
    private updates: VertexBufferUpdate[] = [];

    private byteView: Uint8Array;

    private isShared = false;

    public readonly size: number;

    public constructor(public buffer: ArrayBuffer) {
        super(Buffer);

        if (window.SharedArrayBuffer) {
            this.isShared = buffer instanceof SharedArrayBuffer;
        }

        this.byteView = new Uint8Array(buffer);
        this.size = buffer.byteLength;
    }

    public notify(offset: number, length: number) {
        this.updates.push({
            offset,
            length
        });

        this.needsUpdate = true;
    }

    public writeData(protocol: ProtocolWriter) {
        if (this.isShared || protocol.shared) {
            protocol.writeUInt8(1);
            protocol.passData(this.buffer);
        } else {
            protocol.writeUInt8(0);
            protocol.writeUInt32(this.buffer.byteLength);
            protocol.writeUInt8Array(this.byteView);
        }

        this.needsUpdate = false;
    }

    public writeUpdate(protocol: ProtocolWriter) {
        const updates = this.updates;

        protocol.writeUInt32(updates.length);

        for (let i = 0; i < updates.length; i++) {
            const {offset, length} = updates[i];

            protocol.writeUInt32(offset);
            protocol.writeUInt32(length);

            if (!this.isShared && !protocol.shared) {
                protocol.writeUInt8Array(this.byteView.subarray(offset, offset + length));
            }
        }

        this.updates = [];
    }

    public onUnload() {
        this.needsUpdate = false;
        this.updates = [];
    }
}

export class Buffer extends Resource {
    static resourceName = 'Buffer';

    public buffer: WebGLBuffer;

    private sharedBuffer: Uint8Array;

    public load(protocol: ProtocolReader) {
        let data: Uint8Array;

        const isShared = !!protocol.readUInt8();

        if (isShared) {
            this.sharedBuffer = data = new Uint8Array(protocol.getData());
        } else {
            const length = protocol.readUInt32();
            data = protocol.readUInt8Array(length);
        }

        const gl = this.renderer.gl;

        const buffer = this.buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    public update(protocol: ProtocolReader) {
        const gl = this.renderer.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        const updateNumber = protocol.readUInt32();

        for (let i = 0; i < updateNumber; i++) {
            const offset = protocol.readUInt32();
            const length = protocol.readUInt32();

            if (this.sharedBuffer) {
                gl.bufferSubData(gl.ARRAY_BUFFER, offset, this.sharedBuffer, offset, length);
            } else {
                gl.bufferSubData(gl.ARRAY_BUFFER, offset, protocol.readUInt8Array(length));
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    public unload() {
        const gl = this.renderer.gl;

        gl.deleteBuffer(this.buffer);

        this.buffer = null;
    }
}
