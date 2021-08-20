var CanvasRenderer = RenderCrank.CanvasRenderer, RenderTarget = RenderCrank.RenderTarget, Component = RenderCrank.Component, ArrayBufferProtocol = RenderCrank.ArrayBufferProtocol;
var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
var scene = new Component(function (t) {
    t.rect(200, 200, 400, 400);
});
var sender = new ArrayBufferProtocol();
scene.render(sender);
var drawCalls = sender.send();
var receiver = new ArrayBufferProtocol();
receiver.receive(drawCalls);
var renderer = new CanvasRenderer(canvas);
renderer.render(receiver);
