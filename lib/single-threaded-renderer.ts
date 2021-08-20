import { ArrayBufferProtocolWriter, ArrayBufferProtocolReader, CanvasRenderer } from './core';
import { Component } from './component';

/*
 * Utility class to easily setup single threaded rendering.
 */
export class SingleThreadedCanvasRenderer extends CanvasRenderer {
    private protocolWriter = new ArrayBufferProtocolWriter(true);
    private protocolReader = new ArrayBufferProtocolReader(true);

    public renderComponent(component: Component) {
        component.render(this.protocolWriter);

        const data = this.protocolWriter.flush();

        this.protocolReader.receive(data);

        this.render(this.protocolReader);
    }
}
