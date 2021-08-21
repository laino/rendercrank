import { Instructor, RenderContext } from './core';
import { RunProgram } from './commands';

import {
    ProgramDefinition,
    ProgramRef,
    BufferRef,
    ArrayBufferViewLike,
    ArrayBufferViewLikeType
} from './resources';

interface ProgramCall<P extends ProgramDefinition = ProgramDefinition> {
    program: ProgramRef<P>;
    count: number;
    attributes: number[][][];
}

export class DrawCallBatch {
    private bufferPool = new BufferPool();

    private float32BufferPool = new BufferPoolView(this.bufferPool, Float32Array);
    private int32BufferPool = new BufferPoolView(this.bufferPool, Int32Array);
    private uint32BufferPool = new BufferPoolView(this.bufferPool, Uint32Array);

    private programs: Record<string, ProgramCall> = {};

    public constructor(public context: RenderContext) {
    }

    public program<D extends ProgramDefinition>(
        program: ProgramRef<D>,
        attributes: Required<Record<keyof D['attributes'], number[]>>
    ) {
        const ID = `${program.id}`;

        const layoutAttributes = program.layout.attributes;
        const count = attributes[layoutAttributes[0].name].length / layoutAttributes[0].size;

        let data = this.programs[ID];

        if (!data) {
            this.programs[ID] = data = {
                program,
                count,
                attributes: [],
            };

            for (let i = 0; i < layoutAttributes.length; i++) {
                const {name} = layoutAttributes[i];
                data.attributes[i] = [attributes[name]];
            }

            return;
        }

        data.count += count;

        for (let i = 0; i < layoutAttributes.length; i++) {
            const {name} = layoutAttributes[i];
            data.attributes[i].push(attributes[name]);
        }
    }

    public submit(instructor: Instructor) {
        for (const call of Object.values(this.programs)) {
            this.context.addResource(call.program);

            instructor.command(RunProgram, {
                program: call.program,
                attributes: this.buildAttributes(call),
                count: call.count
            });
        }

        this.programs = {};
        this.bufferPool.reset();
    }

    private buildAttributes(call: ProgramCall<ProgramDefinition>) {
        const attributes = call.program.layout.attributes;

        const map: Record<string, {buffer: BufferRef, byteOffset: number}> = {};

        for (let i = 0; i < attributes.length; i++) {
            const {dataType, name} = attributes[i];
            const data = call.attributes[i];

            if (dataType === WebGL2RenderingContext.FLOAT) {
                map[name] = this.float32BufferPool.writeMultiData(data, call.count * 3);
            } else if (dataType === WebGL2RenderingContext.INT) {
                map[name] = this.int32BufferPool.writeMultiData(data, call.count * 3);
            } else if (dataType === WebGL2RenderingContext.UNSIGNED_INT) {
                map[name] = this.uint32BufferPool.writeMultiData(data, call.count * 3);
            }
        }

        return map;
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

        const byteOffset = this.pool.allocateSpace(byteLength, ELEMENT_SIZE);

        const buffer = this.pool.currentBuffer;

        if (this.currentBuffer !== buffer) {
            this.currentBuffer = buffer;
            this.currentView = new this.type(buffer.buffer);
        }

        let writeOffset = byteOffset / ELEMENT_SIZE;

        for (let i = 0; i < multi.length; i++) {
            const data = multi[i];
            this.currentView.set(data, writeOffset);
            writeOffset += data.length;
        }

        this.currentBuffer.notify(byteOffset, byteLength);

        return {
            buffer,
            byteOffset
        };
    }

    public writeData(data: ArrayLike<number>) {
        const ELEMENT_SIZE = this.type.BYTES_PER_ELEMENT;
        const byteLength = data.length * ELEMENT_SIZE;
        const byteOffset = this.pool.allocateSpace(byteLength, ELEMENT_SIZE);
        const buffer = this.pool.currentBuffer;

        if (this.currentBuffer !== buffer) {
            this.currentBuffer = buffer;
            this.currentView = new this.type(buffer.buffer);
        }

        this.currentView.set(data, byteOffset / ELEMENT_SIZE);
        this.currentBuffer.notify(byteOffset, byteLength);

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

    public allocateSpace(amount: number, align: number) {
        if (this.buffersIndex >= this.buffers.length) {
            this.currentBuffer = new BufferRef(new ArrayBuffer(Math.max(BUFFER_SIZE, amount)));
            this.buffers.push(this.currentBuffer);
        }

        let offset = this.currentBufferOffset;

        if (align > 1) {
            offset = offset + align - 1 - (offset + align - 1) % align;
        }

        const nextOffset = offset + amount;

        if (nextOffset > this.currentBuffer.size) {
            if (this.currentBufferOffset === 0) {
                // We didn't use this buffer. Replace it with one that fits.
                this.buffers.push(this.currentBuffer);
                this.currentBuffer = new BufferRef(new ArrayBuffer(Math.max(BUFFER_SIZE, amount)));
                this.buffers[this.buffersIndex] = this.currentBuffer;
            } else {
                this.buffersIndex++;
                this.currentBufferOffset = 0;
                this.currentBuffer = this.buffers[this.buffersIndex];
                return this.allocateSpace(amount, align);
            }
        }

        this.currentBufferOffset = nextOffset;

        return offset;
    }
}

