import {
    ArrayBufferProtocolWriter,
    Renderer,
    Renderable,
    Instructor,
    RenderContext,
} from '../core';

import { RenderTarget } from './render-target';
/*
 * Utility class to easily setup multi-threaded rendering.
 */
export class WorkerRenderer implements Renderer<RenderTarget> {
    private protocolWriter = new ArrayBufferProtocolWriter();
    private instructor = new Instructor(this.protocolWriter);

    private renderTarget = new RenderTarget();

    public constructor(private canvas: HTMLCanvasElement, private worker: Worker) {
        const offscreen = canvas.transferControlToOffscreen();

        this.worker.postMessage({
            command: 'setup',
            canvas: offscreen,
        }, [offscreen]);
    }

    public render(renderable: Renderable<RenderTarget>) {
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
