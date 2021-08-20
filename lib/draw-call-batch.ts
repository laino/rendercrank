import { Instructor, RenderContext } from './core';
import { RunProgram } from './commands';

import {
    ProgramRef,
    BufferRef,
    ArrayBufferViewLike,
    ArrayBufferViewLikeType
} from './resources';

interface ProgramCall {
    program: ProgramRef,
    triangles: number[][],
    trianglesLength: number
}

export class DrawCallBatch {
    private bufferPool = new BufferPool();
    private float32BufferPool = new BufferPoolView(this.bufferPool, Float32Array);

    private programs: Record<string, ProgramCall> = {};
    private batchedPrograms: number[][] = [];

    public constructor(public context: RenderContext) {
    }

    public program(program: ProgramRef, data: number[]) {
        const ID = `${program.id}`;

        const batch = this.programs[ID];

        if (!batch) {
            this.programs[ID] = {
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
        for (const {program, triangles, trianglesLength} of Object.values(this.programs)) {
            const {
                buffer,
                byteOffset,
            } = this.float32BufferPool.writeMultiData(triangles, trianglesLength);

            instructor.command(RunProgram, {
                program,
                buffer,
                offset: byteOffset,
                length: trianglesLength
            });
        }
    }
}

const BUFFER_SIZE = 1024;

class BufferPoolView {
    private currentBuffer: BufferRef;
    private currentView: ArrayBufferViewLike;

    public constructor(public pool: BufferPool, public type: ArrayBufferViewLikeType) {
    }

    public writeMultiData(multi: ArrayLike<number>[], totalLength: number) {
        const ELEMENT_SIZE = this.type.BYTES_PER_ELEMENT;
        const byteLength = totalLength * ELEMENT_SIZE;

        const byteOffset = this.pool.allocateSpace(byteLength);

        const buffer = this.pool.currentBuffer;

        if (this.currentBuffer !== buffer) {
            this.currentBuffer = buffer;
            this.currentView = new this.type(buffer.buffer);
        }

        let writeOffset = byteOffset;

        for (let i = 0; i < multi.length; i++) {
            const data = multi[i];
            this.currentView.set(data, writeOffset);
            writeOffset += data.length * ELEMENT_SIZE;
        }

        return {
            buffer,
            byteOffset,
            byteLength
        };
    }

    public writeData(data: ArrayLike<number>) {
        const ELEMENT_SIZE = this.type.BYTES_PER_ELEMENT;
        const byteLength = data.length * ELEMENT_SIZE;
        const byteOffset = this.pool.allocateSpace(byteLength);
        const buffer = this.pool.currentBuffer;

        if (this.currentBuffer !== buffer) {
            this.currentBuffer = buffer;
            this.currentView = new this.type(buffer.buffer);
        }

        this.currentView.set(data, byteOffset);

        return {
            buffer,
            byteOffset,
            byteLength
        };
    }
}

class BufferPool {
    private buffers: BufferRef[] = [];
    private buffersIndex = 0;

    public currentBuffer: BufferRef;
    public currentBufferOffset = 0;

    public reset() {
        this.buffersIndex = 0;
        this.currentBufferOffset = 0;
    }

    public allocateSpace(amount: number) {
        if (this.buffersIndex >= this.buffers.length) {
            this.currentBuffer = new BufferRef(new ArrayBuffer(Math.max(BUFFER_SIZE, amount)));
            this.buffers.push(this.currentBuffer);
        }

        const nextOffset = this.currentBufferOffset + amount;

        if (nextOffset > this.currentBuffer.size) {
            if (this.currentBufferOffset === 0) {
                // We didn't use this buffer. Replace it with one that fits.
                this.currentBuffer = new BufferRef(new ArrayBuffer(Math.max(BUFFER_SIZE, amount)));
                this.buffers[this.buffersIndex] = this.currentBuffer;
            } else {
                this.buffersIndex++;
                this.currentBufferOffset = 0;
                this.currentBuffer = this.buffers[this.buffersIndex];
                return this.allocateSpace(amount);
            }
        }

        const old = this.currentBufferOffset;

        this.currentBufferOffset = nextOffset;

        return old;
    }
}

