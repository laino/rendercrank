import { BaseRenderer, BaseRendererOptions } from './base-renderer';
/*
 * Utility class to easily setup multi-threaded rendering.
 */
export class WorkerRenderer extends BaseRenderer {
    public constructor(private worker: Worker, canvas: HTMLCanvasElement, options: BaseRendererOptions = {}) {
        super(options);

        const offscreen = canvas.transferControlToOffscreen();

        this.worker.postMessage({
            command: 'setup',
            canvas: offscreen,
            options: {
                streaming: options.resourceStreaming
            }
        }, [offscreen]);
    }

    protected async submit(data: ArrayBuffer[]) {
        this.worker.postMessage({
            command: 'run',
            data
        }, data);
    }
}
