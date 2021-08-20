export * from './core';
export * from './resources';
export * from './commands';

export * from './render-target';
export * from './render-context';
export * from './component';

import { registerResourceType, registerCommand } from './core';
import { Program, Buffer } from './resources';
import { RunProgram } from './commands';

registerResourceType(Program);
registerResourceType(Buffer);

registerCommand(RunProgram);
