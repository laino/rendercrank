import { Instructor } from './core';
import { ColoredTrianglesProgram } from './programs';
import { DrawCallBatch } from './draw-call-batch';

export class RenderTarget {
    public zIndex = 0;

    private batchStack: DrawCallBatch[] = [];
    private batch: DrawCallBatch;

    private batches = new Set<DrawCallBatch>();

    public pushBatch(batch: DrawCallBatch) {
        if (this.batch) {
            this.batchStack.push(this.batch);
        }

        this.batch = batch;

        this.batches.add(batch);
    }

    public popBatch() {
        return this.batch = this.batchStack.pop();
    }

    public submit(instructor: Instructor) {
        for (const batch of this.batches) {
            instructor.pushContext(batch.context);
            batch.submit(instructor);
            instructor.popContext();
        }

        this.batches.clear();
    }

    public translate(x: number, y: number) {
        //
    }

    public rect(x: number, y: number, width: number, height: number) {
        const z = this.zIndex;

        this.triangles([
            x,         y         , z,
            x + width, y         , z,
            x + width, y + height, z,
            x,         y         , z,
            x + width, y + height, z,
            x        , y + height, z,
        ]);
    }

    public triangles(data: number[]) {
        this.zIndex++;
        this.batch.program(ColoredTrianglesProgram, data);
    }
}

