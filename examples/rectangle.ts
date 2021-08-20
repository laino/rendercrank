const { CanvasRenderer, RenderTarget, Component, ArrayBufferProtocol } = RenderCrank;

const canvas = document.createElement('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.body.appendChild(canvas);

const scene = new Component((t) => {
    t.rect(200, 200, 400, 400);
});

const sender = new ArrayBufferProtocol();

scene.render(sender);

const drawCalls = sender.send();

const receiver = new ArrayBufferProtocol();

receiver.receive(drawCalls);

const renderer = new CanvasRenderer(canvas);

renderer.render(receiver);
