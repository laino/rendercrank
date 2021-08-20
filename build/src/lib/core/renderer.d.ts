import { Resource, ResourceID } from './resource';
import { ProtocolReader } from './protocol';
export interface Renderer {
    gl: WebGL2RenderingContext;
    getResource<T extends typeof Resource>(id: ResourceID, type: T): InstanceType<T>;
    render(protocol: ProtocolReader): any;
}
export declare class CanvasRenderer implements Renderer {
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    private resources;
    constructor(canvas: HTMLCanvasElement);
    getResource<T extends typeof Resource>(id: ResourceID, type: T): InstanceType<T>;
    render(protocol: ProtocolReader): void;
}
