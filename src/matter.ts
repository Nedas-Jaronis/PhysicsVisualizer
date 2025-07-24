import Matter from 'matter-js';

export class MatterManager {
  private engine: Matter.Engine;
  private render: Matter.Render;
  private runner: Matter.Runner;

  constructor(container: HTMLElement) {
    this.engine = Matter.Engine.create();
    this.render = Matter.Render.create({
      element: container,
      engine: this.engine,
      options: {
        width: 800,
        height: 600,
        showVelocity: true,
        wireframes: false,
      },
    });

    // Add bodies
    const world = this.engine.world;
    Matter.Composite.add(world, [
      Matter.Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }),
      Matter.Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.05 }),
      Matter.Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 }),

      // Walls
      Matter.Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
      Matter.Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
      Matter.Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
      Matter.Bodies.rectangle(0, 300, 50, 600, { isStatic: true }),
    ]);

    this.runner = Matter.Runner.create();

    Matter.Render.run(this.render);
    Matter.Runner.run(this.runner, this.engine);
  }

  destroy() {
    Matter.Render.stop(this.render);
    Matter.Runner.stop(this.runner);
    this.render.canvas.remove();
    this.render.textures = {};
  }
}
