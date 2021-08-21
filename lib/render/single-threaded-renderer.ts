import {
    ArrayBufferProtocolWriter,
    ArrayBufferProtocolReader,
    Renderer,
    CanvasRunner,
    Instructor,
    RenderContext,
} from '../core';

import { RenderTarget } from './render-target';
import { Component } from './component';

/*
 * Utility class to easily setup single threaded rendering.
 */
export class SingleThreadedRenderer implements Renderer<RenderTarget> {
    private protocolWriter = new ArrayBufferProtocolWriter(true);
    private protocolReader = new ArrayBufferProtocolReader(true);
    private instructor = new Instructor(this.protocolWriter);

    private renderTarget = new RenderTarget();

    private runner: CanvasRunner;

    public constructor(private canvas: HTMLCanvasElement) {
        this.runner = new CanvasRunner(canvas, this.protocolReader);
    }

    public render(renderable: Component) {
        const target = this.renderTarget;
        const writer = this.protocolWriter;
        const reader = this.protocolReader;
        const instructor = this.instructor;

        instructor.writeCommandMap();

        renderable.render(target);

        target.submit(instructor);

        instructor.finish();

        reader.receive(writer.flush());

        this.runner.next();
    }

    public unload(context: RenderContext) {
        const writer = this.protocolWriter;
        const reader = this.protocolReader;
        const instructor = this.instructor;

        context.unload(this.instructor);

        instructor.finish();

        reader.receive(writer.flush());

        this.runner.next();
    }

    public reset() {
        this.unload(this.renderTarget);
    }
}
