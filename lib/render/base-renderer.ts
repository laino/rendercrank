import {
    ArrayBufferProtocolWriter,
    Renderer,
    Instructor,
    RenderContext,
} from '../core';

import { RenderTarget } from './render-target';
import { Component } from './component';

export interface BaseRendererOptions {
    resourceStreaming?: boolean;
}

export abstract class BaseRenderer implements Renderer<RenderTarget> {
    private protocolWriter = new ArrayBufferProtocolWriter(true);
    private instructor = new Instructor(this.protocolWriter);
    private renderTarget = new RenderTarget();

    public resourceStreaming: boolean;

    public constructor(options: BaseRendererOptions = {}) {
        this.resourceStreaming = !!options.resourceStreaming;
    }

    protected abstract submit(data: ArrayBuffer[]): Promise<void>;

    public async render(renderable: Component) {
        const target = this.renderTarget;
        const writer = this.protocolWriter;
        const instructor = this.instructor;

        instructor.writeCommandMap();

        renderable.render(target);

        target.submit(instructor);

        if (!this.resourceStreaming) {
            await instructor.waitForResources();
        }

        instructor.finish();

        await this.submit(writer.flush());
    }


    public unload(context: RenderContext) {
        const writer = this.protocolWriter;
        const instructor = this.instructor;

        context.unload(this.instructor);

        instructor.finish();

        return this.submit(writer.flush());
    }

    public reset() {
        return this.unload(this.renderTarget);
    }
}
