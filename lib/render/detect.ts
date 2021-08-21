import { Renderer } from '../core';

import { RenderTarget } from './render-target';
import { WorkerRenderer } from './worker-renderer';
import { SingleThreadedRenderer } from './single-threaded-renderer';

export function autoDetectRenderer(canvas: HTMLCanvasElement): Renderer<RenderTarget> {
    if (canvas.transferControlToOffscreen) {
        let worker;
        try {
            worker = new Worker(new URL('./worker-runner.ts', import.meta.url))
        } catch (error) {
            // don't care
        }

        if (worker) {
            return new WorkerRenderer(canvas, worker);
        }
    }

    return new SingleThreadedRenderer(canvas);
}
