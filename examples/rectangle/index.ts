const { component, SingleThreadedCanvasRenderer } = RenderCrank;

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const renderer = new SingleThreadedCanvasRenderer(canvas);

const rectangle = component(t => t.rect(200, 200, 400, 400));

renderer.renderComponent(rectangle);
renderer.unloadComponent(rectangle);
