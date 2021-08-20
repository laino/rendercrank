import { CanvasRenderer } from './core';
import { Component } from './component';
export declare class SingleThreadedCanvasRenderer extends CanvasRenderer {
    private protocolWriter;
    private protocolReader;
    renderComponent(component: Component): void;
    unloadComponent(component: Component): void;
}
