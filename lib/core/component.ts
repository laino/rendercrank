import { RenderTarget } from './render-target';
import { RenderContext } from './render-context';

export type RenderFunction = (target: RenderTarget) => Promise<void> | void;

export class Component extends RenderContext {
    public constructor(public fn: RenderFunction) {
        super();
    }
}
