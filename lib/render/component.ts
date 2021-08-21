import { RenderContext, Renderable } from '../core';
import { RenderTarget } from './render-target';

export abstract class Component extends RenderContext implements Renderable<RenderTarget> {
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

interface ConstructibleComponent {
    new(): Component & {_render(target: RenderTarget)};
}

export function component(render: RenderFunction): Component {
    const component = new (Component as ConstructibleComponent)();
    component._render = render;
    return component;
}

