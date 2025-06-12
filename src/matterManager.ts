import Matter from "matter-js";
import * as ForceInterface from "./types/forceInterface";
import * as MotionInterface from "./types/MotionInterface";
import * as obje

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


interface Interaction {
  type: "collision";
  objectA: string;
  objectB: string;
  coefficientOfRestitution: number;
  contactPoint: [number, number, number];
}

interface Motion {
  objectId: string;
  
  // Linear motion properties
  initialPosition?: Vector;
  initialVelocity?: Vector;
  acceleration?: Vector;
  time?: number;
  finalVelocity?: Vector;
  
  // Harmonic motion properties
  amplitude?: number;
  angularFrequency?: number;
  phase?: number;
  equilibriumPosition?: number;
  mass?: number;
  duration?: number;
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
  forces: Force[];
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
  private constraints: Map<string, Matter.Constraint> = new Map();
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

    // Set appropriate gravity (can be adjusted based on simulation type)
    this.engine.world.gravity.y = 0.8;

    // Create renderer
    this.render = Matter.Render.create({
      canvas: this.canvas,
      engine: this.engine,
      options: {
        width: this.canvas.clientWidth,
        height: this.canvas.clientHeight,
        wireframes: false,
        background: "transparent",
        showVelocity: false,
        showAngleIndicator: false,
        showCollisions: true,
      },
    });

    // Create runner
    this.runner = Matter.Runner.create();

    // Load animation data from window object
    this.loadAnimationData();

    // Setup physics simulation
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

    // Create objects first
    this.createObjects();
    
    // Create forces (springs, constraints, etc.)
    this.createForces();
  }

  private createObjects(): void {
    if (!this.animationData) return;

    this.animationData.objects.forEach((obj, index) => {
      // Scale positions for visualization
      const scaledX = this.canvas.clientWidth * 0.5 + (obj.position.x ?? 0) * 200;
      const scaledY = this.canvas.clientHeight * 0.5 + (obj.position.y ?? 0) * 200;

      // Body size based on mass
      const radius = Math.max(15, Math.sqrt(obj.mass) * 10);

      // Create circular body for better physics
      const body = Matter.Bodies.circle(scaledX, scaledY, radius, {
        mass: obj.mass,
        frictionAir: 0.01,
        friction: 0.1,
        restitution: 0.8,
        render: {
          fillStyle: index === 0 ? COLOR_MAP.RED : COLOR_MAP.BLUE,
          strokeStyle: "#000",
          lineWidth: 2,
        },
        label: obj.id,
      });

      // Set initial velocity if specified
      if (obj.velocity) {
        const scaledVelocity = {
          x: obj.velocity.x * 50,
          y: obj.velocity.y * 50,
        };
        Matter.Body.setVelocity(body, scaledVelocity);
      }

      this.bodies.set(obj.id, body);
      Matter.World.add(this.world, body);
    });

    console.log("Created bodies:", Array.from(this.bodies.keys()));
  }

  private createForces(): void {
    if (!this.animationData) return;

    this.animationData.forces.forEach((force) => {
      const body = this.bodies.get(force.applied_to);
      if (!body) {
        console.warn(`Body ${force.applied_to} not found for force ${force.id}`);
        return;
      }

      if (force.spring_constant && force.displacement !== undefined) {
        // Create a spring constraint
        const motion = this.animationData!.motions.find(m => m.objectId === force.applied_to);
        
        // Determine anchor point (where spring is attached)
        let anchorX = body.position.x;
        let anchorY = body.position.y;
        
        // If we have motion data with equilibrium position, use that
        if (motion && motion.equilibriumPosition !== undefined) {
          anchorX = this.canvas.clientWidth * 0.5 + motion.equilibriumPosition * 200;
        }
        
        // Adjust anchor based on displacement
        anchorX -= force.displacement * 200;

        // Create anchor body (invisible, static)
        const anchor = Matter.Bodies.circle(anchorX, anchorY, 5, {
          isStatic: true,
          render: {
            fillStyle: COLOR_MAP.GREEN,
            strokeStyle: "#000",
            lineWidth: 1,
          }
        });

        Matter.World.add(this.world, anchor);

        // Create spring constraint
        const spring = Matter.Constraint.create({
          bodyA: anchor,
          bodyB: body,
          stiffness: force.spring_constant / 1000, // Scale down for Matter.js
          damping: 0.01,
          length: Math.abs(force.displacement) * 200, // Rest length
          render: {
            visible: true,
            lineWidth: 3,
            strokeStyle: COLOR_MAP.GREEN,
            type: 'spring',
            anchors: true
          }
        });

        this.constraints.set(force.id, spring);
        Matter.World.add(this.world, spring);

        console.log(`Created spring ${force.id} with k=${force.spring_constant}, displacement=${force.displacement}`);
      }
    });
  }

  private setupCollisions(): void {
    if (!this.animationData) return;

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

    // Apply restitution
    body1.restitution = coefficientOfRestitution;
    body2.restitution = coefficientOfRestitution;

    // Change colors on collision
    body1.render.fillStyle = COLOR_MAP.PURPLE;
    body2.render.fillStyle = COLOR_MAP.PURPLE;

    this.dispatchPhysicsUpdate();
  }

  private dispatchPhysicsUpdate(): void {
    if (!this.animationData) return;

    const currentTime = this.engine.timing.timestamp / 1000 - this.startTime;
    const firstBody = Array.from(this.bodies.values())[0];

    const physicsData = {
      height: firstBody
        ? Math.abs(firstBody.position.y - this.canvas.clientHeight * 0.5) / 200
        : 0,
      velocity: firstBody
        ? Math.sqrt(firstBody.velocity.x ** 2 + firstBody.velocity.y ** 2) / 50
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
    this.constraints.clear();

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
    this.constraints.clear();

    console.log("MatterManager cleaned up");
  }
}

export default MatterManager;