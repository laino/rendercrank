import { Instructor } from './core';
import { RenderContext } from './render-context';
import { ProgramRef } from './resources';
export declare class RenderTarget {
    private context;
    zIndex: number;
    private drawCallBatcher;
    constructor(context: RenderContext);
    submit(instructor: Instructor): void;
    rect(x: number, y: number, width: number, height: number): void;
    triangles(data: number[]): void;
}
export declare class DrawCallBatcher {
    private programs;
    private batchedPrograms;
    drawTriangles(context: RenderContext, program: ProgramRef, data: number[]): void;
    submit(instructor: Instructor): void;
}
