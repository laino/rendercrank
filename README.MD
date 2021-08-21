RenderCrank
===========

Unopinionated 2D WebGL Renderer with automatic batching, resource management/streaming, and support
for WebWorker/OffscreenCanvas.

Features
---------

- [x] **Unopinionated**: Doesn't force you into one way of managing your data - you just submit draw calls!

- [x] **Draw Call Batching**: Automatically reorders and batches calls.

- [x] **Offscreen Canvas**: Draw in the main thread and render in a WebWorker or vice-versa!

- [x] **Automatic Resource Management**: Keeps track of what resources you used and where.

- [x] **Resource Streaming**: Load resources asynchronously.

- [x] **TypeScript**: Typechecked all the way down to shader attributes.

Example
-------

```ts
import { SingleThreadedRenderer, component } from 'rendercrank';

// Create a Canvas
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

// Utility class to create a single-threaded renderer quickly:
const renderer = new SingleThreadedRenderer(canvas);

// Components wrap functions that draw something and automatically
// keep track of (and reference) resources used within them:
const scene = component(t => t.rect(200, 200, 400, 400));

// Render the component:
renderer.render(scene);

// When you are not going to render some component in the near future,
// it may be wise to release resources used by it.
renderer.unload(scene);

// Unloads things globally used by the renderer.
renderer.reset();
```

Contributing
------------

```bash
# Checkout
git clone https://github.com/laino/rendercrank.git
cd rendercrank
yarn install
yarn build

# Watch and automatically rebuild
yarn watch
```

Open ``examples/rectangle/index.html`` in a browser of your choice - it should work!
