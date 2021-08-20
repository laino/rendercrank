import { ProtocolWriter, ResourceRef } from './core';
import { RenderTarget } from './render-target';
import { RenderContext } from './render-context';
export declare type RenderFunction = (target: RenderTarget) => Promise<void> | void;
export declare class Component extends RenderContext {
    fn: RenderFunction;
    private renderTarget;
    resources: Set<ResourceRef>;
    constructor(fn: RenderFunction);
    render(protocol: ProtocolWriter): void;
    unload(protocol: ProtocolWriter): void;
}
