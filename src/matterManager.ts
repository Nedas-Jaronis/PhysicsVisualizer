import Matter from "matter-js";

// Color mapping
const COLOR_MAP: { [key: string]: string } = {
  RED: "#FF0000",
  GREEN: "#00FF00",
  BLUE: "#0000FF",
  YELLOW: "#FFFF00",
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  PURPLE: "#800080",
  ORANGE: "#FFA500",
  PINK: "#FFC0CB",
  TEAL: "#008080",
};

// Interfaces for vectors, objects, interactions, motions, animation data
interface Vector {
  x: number;
  y: number;
  z?: number; // optional, some data have z
}

interface Interaction {
  type: "collision"; // from your JSON it's "collision" not "inelastic collision"
  objectA: string;
  objectB: string;
  coefficientOfRestitution: number;
  contactPoint: [number, number, number]; // 3D point
}

interface Motion {
  object: string;
  initialPosition: Vector;
  initialVelocity: Vector;
  acceleration?: Vector;
  time: number;
  finalVelocity?: Vector; // optional: not in your JSON but can add if needed
}

interface ObjectData {
  id: string;
  mass: number;
  position: Vector;
  velocity: Vector;
  acceleration?: Vector;
  angular_velocity?: number;
  orientation?: { angle: number };
  type?: string;
}

interface AnimationData {
  forces: any[]; // Keep as any for now (empty array in your JSON)
  interactions: Interaction[];
  motions: Motion[];
  objects: ObjectData[];
}

class MatterManager {
  private canvas: HTMLCanvasElement;
  private engine: Matter.Engine;
  private world: Matter.World;
  private render: Matter.Render;
  private runner: Matter.Runner;
  private bodies: Map<string, Matter.Body> = new Map();
  private animationData: AnimationData | null = null;
  private hasCollided = false;
  private timeScale = 1.0;
  private isPaused = false;
  private startTime = 0;
  private animationStarted = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Create engine and world
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;

    // No gravity for cart collision simulation
    this.engine.world.gravity.y = 0;

    // Create renderer
    this.render = Matter.Render.create({
      canvas: this.canvas,
      engine: this.engine,
      options: {
        width: this.canvas.clientWidth,
        height: this.canvas.clientHeight,
        wireframes: false,
        background: "transparent",
        showVelocity: true,
        showAngleIndicator: true,
        showCollisions: true,
      },
    });

    // Create runner
    this.runner = Matter.Runner.create();

    // Load animation data from window object
    this.loadAnimationData();

    // Setup physics simulation bodies
    this.setupPhysics();

    // Setup collision handling
    this.setupCollisions();

    // Start rendering
    Matter.Render.run(this.render);
  }

  private loadAnimationData(): void {
    const windowWithData = window as Window & { ANIMATION_DATA?: any };
    const data = windowWithData.ANIMATION_DATA;

    if (!data) {
      console.warn("No animation data found on window object");
      this.animationData = null;
      return;
    }

    try {
      if (typeof data === "string") {
        this.animationData = JSON.parse(data);
        console.log("Loaded animation data (from string):", this.animationData);
      } else if (typeof data === "object") {
        this.animationData = data;
        console.log("Loaded animation data (from object):", this.animationData);
      } else {
        console.warn("Animation data is neither string nor object:", data);
        this.animationData = null;
      }
    } catch (error) {
      console.error("Failed to parse animation data:", error);
      this.animationData = null;
    }
  }

  private setupPhysics(): void {
    if (!this.animationData) {
      console.warn("No animation data available for physics setup");
      return;
    }

    // Create bodies for each object in animation data
    this.animationData.objects.forEach((obj, index) => {
      // Find corresponding motion entry by matching object id
      const motion = this.animationData!.motions.find(
        (m) => m.object === obj.id
      );

      // Scale positions for visualization (adjust scale as needed)
      const scaledX =
        this.canvas.clientWidth * 0.2 + (obj.position.x ?? 0) * 100;
      const scaledY =
        this.canvas.clientHeight * 0.5 + (obj.position.y ?? 0) * 100;

      // Body size depends on mass
      const width = Math.max(40, Math.sqrt(obj.mass) * 20);
      const height = Math.max(30, Math.sqrt(obj.mass) * 15);

      // Create rectangle body
      const body = Matter.Bodies.rectangle(scaledX, scaledY, width, height, {
        mass: obj.mass,
        frictionAir: 0,
        friction: 0,
        restitution: 0,
        render: {
          fillStyle: index === 0 ? COLOR_MAP.RED : COLOR_MAP.BLUE,
          strokeStyle: "#000",
          lineWidth: 2,
        },
        label: obj.id,
      });

      // Set initial velocity if present in motions or object velocity
      const velocityVector = motion?.initialVelocity ?? obj.velocity ?? { x: 0, y: 0 };
      const scaledVelocity = {
        x: velocityVector.x * 20,
        y: velocityVector.y * 20,
      };
      Matter.Body.setVelocity(body, scaledVelocity);

      this.bodies.set(obj.id, body);
      Matter.World.add(this.world, body);
    });

    console.log("Created bodies:", Array.from(this.bodies.keys()));
  }

  private setupCollisions(): void {
    if (!this.animationData) return;

    // Filter only collision interactions
    const collisions = this.animationData.interactions.filter(
      (interaction) => interaction.type === "collision"
    );

    if (collisions.length === 0) return;

    Matter.Events.on(this.engine, "collisionStart", (event) => {
      if (this.hasCollided) return;

      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        collisions.forEach((collision) => {
          const { objectA, objectB, coefficientOfRestitution } = collision;
          const body1 = this.bodies.get(objectA);
          const body2 = this.bodies.get(objectB);

          if (!body1 || !body2) return;

          if (
            (bodyA === body1 && bodyB === body2) ||
            (bodyA === body2 && bodyB === body1)
          ) {
            this.handleCollision(collision);
          }
        });
      });
    });
  }

  private handleCollision(collision: Interaction): void {
    if (this.hasCollided) return;
    this.hasCollided = true;

    console.log("Collision detected:", collision);

    const { objectA, objectB, coefficientOfRestitution } = collision;
    const body1 = this.bodies.get(objectA);
    const body2 = this.bodies.get(objectB);

    if (!body1 || !body2) return;

    // Find motions for both objects
    const motion1 = this.animationData!.motions.find((m) => m.object === objectA);
    const motion2 = this.animationData!.motions.find((m) => m.object === objectB);

    if (!motion1 || !motion2) return;

    // For perfectly inelastic collision (restitution = 0)
    if (coefficientOfRestitution === 0) {
      // Set both bodies to the same final velocity (using motion1 final velocity or fallback to initial)
      const finalVelocityVec =
        motion1.finalVelocity ?? motion1.initialVelocity ?? { x: 0, y: 0 };

      const finalVelocity = {
        x: finalVelocityVec.x * 20,
        y: finalVelocityVec.y * 20,
      };

      Matter.Body.setVelocity(body1, finalVelocity);
      Matter.Body.setVelocity(body2, finalVelocity);

      // Change colors on collision
      body1.render.fillStyle = COLOR_MAP.PURPLE;
      body2.render.fillStyle = COLOR_MAP.PURPLE;

      console.log("Applied final velocities:", finalVelocity);

      this.dispatchPhysicsUpdate();
    }
  }

  private dispatchPhysicsUpdate(): void {
    if (!this.animationData) return;

    const currentTime = this.engine.timing.timestamp / 1000 - this.startTime;

    // Use first body as reference for height/velocity display (can customize)
    const firstBody = Array.from(this.bodies.values())[0];

    const physicsData = {
      height: firstBody
        ? Math.abs(firstBody.position.y - this.canvas.clientHeight * 0.5) / 100
        : 0,
      velocity: firstBody
        ? Math.sqrt(firstBody.velocity.x ** 2 + firstBody.velocity.y ** 2) / 20
        : 0,
      time: currentTime,
      phase: this.hasCollided ? 2 : 1,
      timeScale: this.timeScale,
      isPaused: this.isPaused,
    };

    const event = new CustomEvent("physicsUpdate", { detail: physicsData });
    window.dispatchEvent(event);
  }

  public startAnimation(): void {
    if (this.animationStarted) return;

    this.animationStarted = true;
    this.startTime = this.engine.timing.timestamp / 1000;
    this.hasCollided = false;

    Matter.Runner.run(this.runner, this.engine);

    const updateInterval = setInterval(() => {
      if (!this.animationStarted) {
        clearInterval(updateInterval);
        return;
      }
      this.dispatchPhysicsUpdate();
    }, 50);

    console.log("Animation started");
  }

  public resetAnimation(): void {
    this.animationStarted = false;
    this.hasCollided = false;
    this.isPaused = false;
    this.timeScale = 1.0;

    Matter.Runner.stop(this.runner);

    Matter.World.clear(this.world, false);
    this.bodies.clear();

    this.setupPhysics();
    this.setupCollisions();

    console.log("Animation reset");
  }

  public togglePause(): void {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      Matter.Runner.stop(this.runner);
    } else {
      Matter.Runner.run(this.runner, this.engine);
    }

    this.dispatchPhysicsUpdate();
  }

  public toggleSlowMotion(): void {
    this.timeScale = this.timeScale === 1.0 ? 0.3 : 1.0;
    this.engine.timing.timeScale = this.timeScale;
    this.dispatchPhysicsUpdate();
  }

  public resize(): void {
    this.render.canvas.width = this.canvas.clientWidth;
    this.render.canvas.height = this.canvas.clientHeight;
    this.render.options.width = this.canvas.clientWidth;
    this.render.options.height = this.canvas.clientHeight;
  }

  public cleanup(): void {
    this.animationStarted = false;

    Matter.Runner.stop(this.runner);
    Matter.Render.stop(this.render);

    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);

    this.bodies.clear();

    console.log("MatterManager cleaned up");
  }
}

export default MatterManager;
