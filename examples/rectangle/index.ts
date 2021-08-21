const { component, SingleThreadedRenderer } = RenderCrank;

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const renderer = new SingleThreadedRenderer(canvas);

const rectangle = component(t => t.rect(200, 200, 400, 400));

renderer.render(rectangle);

renderer.unload(rectangle);

renderer.reset();
