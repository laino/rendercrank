RenderCrank
===========

Unopinionated 2D WebGL Renderer with automatic batching, resource management/streaming, and support
for WebWorkers/OffscreenCanvas.

Features
---------

- [x] **TypeScript**: Completely written in TypeScript.

- [x] **Unopinionated**: Doesn't force you into any way of managing your data - you just submit draw calls!

- [x] **Draw Call Batching**: Automatically batches any calls that can be batched.

- [x] **Offscreen Canvas**: Draw in the main thread and render in a WebWorker or vice-versa!.

- [x] **Automatic Resource Management**: Keeps track of what resources you used and where.

- [x] **Resource Streaming**: Load resources asynchronously.

Example
-------

```ts
import { SingleThreadedCanvasRenderer, Component } from 'rendercrank';

// Create a Canvas
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

// Utility class to create a single-threaded renderer quickly:
const renderer = new SingleThreadedCanvasRenderer(canvas);

// Components wrap functions that draw something and automatically
// keep track of (and reference) resources used within them:
const scene = new Component((target) => {
    target.rect(200, 200, 400, 400);
});

// Render the component:
renderer.renderComponent(scene);

// All resources allocated to run the draw calls:
console.log(scene.resources); // Set [ ProgramRef, BufferRef, ... ]

// When you are not going to render some component in the near future,
// it may be wise to release resources used by it.
// Unreferences all resources used by the component and possibly unloads them:
renderer.unloadComponent(scene);
```
