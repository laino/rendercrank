import { Instructor, RenderContext } from './core';
import { ColoredTrianglesProgram } from './programs';
import { DrawCallBatch } from './draw-call-batch';
import { Component } from './component';

export class RenderTarget extends RenderContext {
    public zIndex = 0;

    private batch: DrawCallBatch = new DrawCallBatch(this);

    private contextStack: RenderContext[] = [];
    private context: RenderContext;

    public pushContext(context: RenderContext) {
        if (this.context) {
            this.contextStack.push(this.context);
        }

        this.context = context;
    }

    public popContext() {
        return this.context = this.contextStack.pop();
    }

    public submit(instructor: Instructor) {
        this.batch.submit(instructor);
    }

    public translate(x: number, y: number) {
        //
    }

    /*
    public renderIntoTexture(texture: RenderTexture, (fn: RenderTarget) => void) {
    }
    */

    public component(component: Component) {
        component.render(this);
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
        this.batch.program(ColoredTrianglesProgram, {
            color: data,
            position: data,
        });
    }
}

