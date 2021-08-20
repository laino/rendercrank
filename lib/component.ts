import { RenderContext } from './core';
import { RenderTarget } from './render-target';

export abstract class Component extends RenderContext {
    public constructor() {
        super();
    }

    public render(target: RenderTarget) {
        target.pushContext(this);
        this._render(target);
        target.popContext();
    }

    protected abstract _render(target: RenderTarget);
}

export type RenderFunction = (target: RenderTarget) => void;

export function component(render: RenderFunction) {
    const component = new (Component as any)();
    component._render = render;
    return component as Component;
}

