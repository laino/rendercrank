import {
    ArrayBufferProtocolWriter,
    ArrayBufferProtocolReader,
    CanvasRenderer,
    Instructor,
    RenderContext
} from './core';

import { Component } from './component';
import { RenderTarget } from './render-target';

/*
 * Utility class to easily setup single threaded rendering.
 */
export class SingleThreadedCanvasRenderer extends CanvasRenderer {
    private protocolWriter = new ArrayBufferProtocolWriter(true);
    private protocolReader = new ArrayBufferProtocolReader(true);
    private instructor = new Instructor(this.protocolWriter);

    private renderTarget = new RenderTarget();

    public renderComponent(component: Component) {
        const target = this.renderTarget;
        const writer = this.protocolWriter;
        const reader = this.protocolReader;
        const instructor = this.instructor;

        instructor.writeCommandMap();

        component.render(target);

        target.submit(instructor);

        instructor.finish();

        reader.receive(writer.flush());

        this.render(reader);
    }

    public unload(context: RenderContext) {
        const writer = this.protocolWriter;
        const reader = this.protocolReader;

        context.unload(this.instructor);

        const data = writer.flush();

        reader.receive(data);

        this.render(reader);
    }

    public reset() {
        this.unload(this.renderTarget);
    }
}
