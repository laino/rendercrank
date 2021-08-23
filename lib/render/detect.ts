import { WorkerRenderer } from './worker-renderer';
import { SingleThreadedRenderer } from './single-threaded-renderer';
import { BaseRenderer, BaseRendererOptions } from './base-renderer';

export function autoDetectRenderer(
    canvas: HTMLCanvasElement,
    options: BaseRendererOptions = {}): BaseRenderer {

    if (canvas.transferControlToOffscreen) {
        let worker;
        try {
            worker = new Worker(new URL('./worker-runner.ts', import.meta.url));
        } catch (error) {
            // don't care
        }

        if (worker) {
            return new WorkerRenderer(worker, canvas, options);
        }
    }

    return new SingleThreadedRenderer(canvas, options);
}
