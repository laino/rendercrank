var Component = RenderCrank.Component, SingleThreadedCanvasRenderer = RenderCrank.SingleThreadedCanvasRenderer;
var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
// Utility class to create a single threaded renderer quickly
var renderer = new SingleThreadedCanvasRenderer(canvas);
// Components wrap functions that draw something and automatically
// keep track of (and reference) resources used within them.
var scene = new Component(function (t) {
    t.rect(200, 200, 400, 400);
});
// Render the component
renderer.renderComponent(scene);
console.log(scene.resources);
// Unreferences all resources used by the component and
// possibly unloads them
renderer.unloadComponent(scene);
//# sourceMappingURL=index.js.map