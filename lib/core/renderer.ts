import { Protocol } from './protocol';
import { Resource, Program, Buffer } from '../resources';

const RESOURCE_MAP: Record<string, typeof Resource> = {};

registerResourceType(Program);
registerResourceType(Buffer);

export function registerResourceType(resource: typeof Resource) {
    if (Object.prototype.hasOwnProperty.call(RESOURCE_MAP, resource.name)) {
        throw new Error(`A resource type with the name ${resource.name} is already registered.`);
    }

    RESOURCE_MAP[resource.name] = resource;
}

export class Renderer {
    public gl: WebGL2RenderingContext;


    public constructor(public canvas: HTMLCanvasElement) {
        this.gl = canvas.getContext('webgl2');
    }

    public render(protocol: Protocol) {
        //
    }
}

