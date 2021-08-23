import { Instructor, RenderContext, Allocator, SharedAllocator, RepeatableSharedAllocator } from '../core';
import { RunProgram } from '../commands';

import {
    ProgramDefinition,
    ProgramRef,
    BufferRef,
    ArrayBufferViewLike,
    ArrayBufferViewLikeType,
} from '../resources';

interface ProgramCall<P extends ProgramDefinition = ProgramDefinition> {
    program: ProgramRef<P>;
    count: number;
    attributes: number[][][];
}

export class DrawCallBatch {
    private bufferPool = new RepeatableSharedAllocator(new BufferAllocator(this.context));

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
        const id = `${program.id}`;

        const layoutAttributes = program.layout.attributes;
        const count = attributes[layoutAttributes[0].name].length / layoutAttributes[0].size;

        let data = this.programs[id];

        if (!data) {
            this.programs[id] = data = {
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
            const vao = call.program.createVAO(this.buildAttributes(call));
            
            this.context.addResource(call.program);
            this.context.addResource(vao);

            instructor.command(RunProgram, {
                program: call.program,
                uniforms: {},
                vao,
                offset: 0,
                count: call.count
            });
        }

        this.programs = {};
        this.bufferPool.repeat();
    }

    private buildAttributes(call: ProgramCall<ProgramDefinition>) {
        const attributes = call.program.layout.attributes;

        const map: Record<string, {buffer: BufferRef, offset: number}> = {};

        for (let i = 0; i < attributes.length; i++) {
            const {dataType, name, size} = attributes[i];
            const data = call.attributes[i];

            if (dataType === WebGL2RenderingContext.FLOAT) {
                map[name] = this.float32BufferPool.writeMultiData(data, call.count * size);
            } else if (dataType === WebGL2RenderingContext.INT) {
                map[name] = this.int32BufferPool.writeMultiData(data, call.count * size);
            } else if (dataType === WebGL2RenderingContext.UNSIGNED_INT) {
                map[name] = this.uint32BufferPool.writeMultiData(data, call.count * size);
            }
        }

        return map;
    }
}

const MIN_BUFFER_SIZE = 1024;

class BufferPoolView {
    private currentBuffer: BufferRef;
    private currentView: ArrayBufferViewLike;

    public constructor(public pool: SharedAllocator<BufferRef>, public type: ArrayBufferViewLikeType) {
    }

    public writeMultiData(multi: ArrayLike<number>[], totalLength: number) {
        const ELEMENT_SIZE = this.type.BYTES_PER_ELEMENT;
        const byteLength = totalLength * ELEMENT_SIZE;

        const byteOffset = this.pool.allocate(byteLength, ELEMENT_SIZE);

        const buffer = this.pool.current;

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
            offset: byteOffset
        };
    }

    public writeData(data: ArrayLike<number>) {
        const ELEMENT_SIZE = this.type.BYTES_PER_ELEMENT;
        const byteLength = data.length * ELEMENT_SIZE;
        const byteOffset = this.pool.allocate(byteLength, ELEMENT_SIZE);
        const buffer = this.pool.current;

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

class BufferAllocator extends Allocator<BufferRef> {
    public constructor(private context: RenderContext) {
        super();
    }

    create(size: number) {
        const ref = new BufferRef(new ArrayBuffer(Math.max(MIN_BUFFER_SIZE, size)));

        this.context.addResource(ref);

        return ref;
    }

    discard(ref: BufferRef) {
        this.context.removeResource(ref);
    }

    sizeOf(ref: BufferRef) {
        return ref.size;
    }
}

