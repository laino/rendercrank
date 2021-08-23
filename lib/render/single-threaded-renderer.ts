import {
    ArrayBufferProtocolReader,
    CanvasRunner,
} from '../core';

import { BaseRenderer, BaseRendererOptions } from './base-renderer';

/*
 * Utility class to easily setup single threaded rendering.
 */
export class SingleThreadedRenderer extends BaseRenderer {
    private protocolReader = new ArrayBufferProtocolReader(true);
    private runner: CanvasRunner;

    public constructor(canvas: HTMLCanvasElement, options: BaseRendererOptions = {}) {
        super(options);

        this.runner = new CanvasRunner(canvas, this.protocolReader, {
            streaming: options.resourceStreaming
        });
    }

    protected async submit(data: ArrayBuffer[]) {
        this.protocolReader.receive(data);

        this.runner.next();
    }
}
