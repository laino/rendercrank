var Component = RenderCrank.Component, SingleThreadedCanvasRenderer = RenderCrank.SingleThreadedCanvasRenderer;
var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
var renderer = new SingleThreadedCanvasRenderer(canvas);
var scene = new Component(function (t) {
    t.rect(200, 200, 400, 400);
});
renderer.renderComponent(scene);
