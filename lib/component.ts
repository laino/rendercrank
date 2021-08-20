import { RenderContext, Instructor } from './core';
import { RenderTarget } from './render-target';
import { DrawCallBatch } from './draw-call-batch';

export abstract class Component extends RenderContext {
    private batch = new DrawCallBatch(this);

    public constructor() {
        super();
    }

    public render(target: RenderTarget) {
        target.pushBatch(this.batch);
        this._render(target);
        target.popBatch();
    }

    protected abstract _render(target: RenderTarget);
}

export type RenderFunction = (target: RenderTarget) => void;

export function component(render: RenderFunction) {
    const component = new (Component as any)();
    component._render = render;
    return component as Component;
}

