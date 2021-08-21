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
 * Utility class to easily setup multi-threaded rendering.
 */
export class WebworkerRenderer implements Renderer<RenderTarget> {
    private protocolWriter = new ArrayBufferProtocolWriter();
    private instructor = new Instructor(this.protocolWriter);

    private renderTarget = new RenderTarget();

    private worker: Worker;

    public constructor(canvas: HTMLCanvasElement) {
        this.worker = new Worker(new URL('./webworker-runner.js', import.meta.url));

        const offscreen = canvas.transferControlToOffscreen();

        this.worker.postMessage({
            command: 'setup',
            canvas: offscreen,
        }, [offscreen]);
    }

    public render(renderable: Component) {
        const target = this.renderTarget;
        const writer = this.protocolWriter;
        const instructor = this.instructor;

        instructor.writeCommandMap();

        renderable.render(target);

        target.submit(instructor);

        instructor.finish();

        const data = writer.flush();

        this.worker.postMessage({
            command: 'run',
            data
        }, data);
    }

    public unload(context: RenderContext) {
        const writer = this.protocolWriter;
        const instructor = this.instructor;

        context.unload(this.instructor);

        instructor.finish();

        const data = writer.flush();

        this.worker.postMessage({
            command: 'run',
            data
        }, data);
    }

    public reset() {
        this.unload(this.renderTarget);
    }
}