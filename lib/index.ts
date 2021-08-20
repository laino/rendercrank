export * from './core';
export * from './resources';
export * from './commands';

export * from './render-target';
export * from './component';
export * from './single-threaded-renderer';

import { registerResourceType } from './core';
import { Program, Buffer } from './resources';

registerResourceType(Program);
registerResourceType(Buffer);
