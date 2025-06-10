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

// Interfaces
interface Vector {
  x: number;
  y: number;
}

interface Interaction {
  type: "inelastic collision";
  objects: string[];
  coefficientOfRestitution: number;
  energyLost: number;
}

interface Motion {
  object: string;
  initialVelocity: Vector;
  finalVelocity: Vector;
}

interface ObjectData {
  name: string;
  mass: number;
  initialPosition: Vector;
}

interface AnimationData {
  forces: any[];
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
    
    // Create engine
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    
    // Remove gravity for cart collision simulation
    this.engine.world.gravity.y = 0;
    
    // Create renderer
    this.render = Matter.Render.create({
      canvas: this.canvas,
      engine: this.engine,
      options: {
        width: this.canvas.clientWidth,
        height: this.canvas.clientHeight,
        wireframes: false,
        background: 'transparent',
        showVelocity: true,
        showAngleIndicator: true,
        showCollisions: true,
      }
    });

    // Create runner
    this.runner = Matter.Runner.create();
    
    // Load animation data
    this.loadAnimationData();
    
    // Setup physics simulation
    this.setupPhysics();
    
    // Setup collision detection
    this.setupCollisions();
    
    // Start rendering
    Matter.Render.run(this.render);
  }

  private loadAnimationData(): void {
    try {
      // Type-safe way to access window properties
      const windowWithData = window as Window & { ANIMATION_DATA?: string };
      const dataString = windowWithData.ANIMATION_DATA;
      
      if (dataString) {
        this.animationData = JSON.parse(dataString);
        console.log('Loaded animation data:', this.animationData);
      } else {
        console.warn('No animation data found on window object');
      }
    } catch (error) {
      console.error('Failed to load animation data:', error);
    }
  }

  private setupPhysics(): void {
    if (!this.animationData) {
      console.warn('No animation data available for physics setup');
      return;
    }

    // Create bodies for each object
    this.animationData.objects.forEach((obj, index) => {
      const motion = this.animationData!.motions.find(m => m.object === obj.name);
      
      // Scale positions for better visualization (convert to pixels)
      const scaledX = this.canvas.clientWidth * 0.2 + (obj.initialPosition.x * 100);
      const scaledY = this.canvas.clientHeight * 0.5 + (obj.initialPosition.y * 100);
      
      // Create body dimensions based on mass (larger mass = larger body)
      const width = Math.max(40, Math.sqrt(obj.mass) * 20);
      const height = Math.max(30, Math.sqrt(obj.mass) * 15);
      
      const body = Matter.Bodies.rectangle(
        scaledX,
        scaledY,
        width,
        height,
        {
          mass: obj.mass,
          frictionAir: 0, // No air resistance
          friction: 0,    // No friction
          restitution: 0, // No bouncing
          render: {
            fillStyle: index === 0 ? COLOR_MAP.RED : COLOR_MAP.BLUE,
            strokeStyle: '#000',
            lineWidth: 2
          },
          label: obj.name // Important: set label for identification
        }
      );

      // Set initial velocity if available
      if (motion && motion.initialVelocity) {
        // Scale velocity for visualization
        const scaledVelocity = {
          x: motion.initialVelocity.x * 20, // Scale factor for better visualization
          y: motion.initialVelocity.y * 20
        };
        Matter.Body.setVelocity(body, scaledVelocity);
      }

      this.bodies.set(obj.name, body);
      Matter.World.add(this.world, body);
    });

    console.log('Created bodies:', Array.from(this.bodies.keys()));
  }

  private setupCollisions(): void {
    if (!this.animationData) return;

    // Find inelastic collision interactions
    const inelasticCollisions = this.animationData.interactions.filter(
      interaction => interaction.type === "inelastic collision"
    );

    if (inelasticCollisions.length === 0) return;

    // Setup collision event listener
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      if (this.hasCollided) return; // Prevent multiple collision handling
      
      event.pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        
        // Find which collision this corresponds to
        inelasticCollisions.forEach(collision => {
          const [obj1Name, obj2Name] = collision.objects;
          const body1 = this.bodies.get(obj1Name);
          const body2 = this.bodies.get(obj2Name);
          
          if (!body1 || !body2) return;
          
          // Check if this collision involves our objects
          if ((bodyA === body1 && bodyB === body2) || (bodyA === body2 && bodyB === body1)) {
            this.handleInelasticCollision(collision);
          }
        });
      });
    });
  }

  private handleInelasticCollision(collision: Interaction): void {
    if (this.hasCollided) return;
    this.hasCollided = true;
    
    console.log('Collision detected:', collision);
    
    const [obj1Name, obj2Name] = collision.objects;
    const body1 = this.bodies.get(obj1Name);
    const body2 = this.bodies.get(obj2Name);
    
    if (!body1 || !body2) return;
    
    // Get final velocities from motion data
    const motion1 = this.animationData!.motions.find(m => m.object === obj1Name);
    const motion2 = this.animationData!.motions.find(m => m.object === obj2Name);
    
    if (!motion1 || !motion2) return;
    
    // For perfectly inelastic collision (coefficient of restitution = 0)
    if (collision.coefficientOfRestitution === 0) {
      // Set both bodies to the same final velocity
      const finalVelocity = {
        x: motion1.finalVelocity.x * 20, // Scale for visualization
        y: motion1.finalVelocity.y * 20
      };
      
      Matter.Body.setVelocity(body1, finalVelocity);
      Matter.Body.setVelocity(body2, finalVelocity);
      
      // Change colors to indicate they've collided
      body1.render.fillStyle = COLOR_MAP.PURPLE;
      body2.render.fillStyle = COLOR_MAP.PURPLE;
      
      console.log('Applied final velocities:', finalVelocity);
      
      // Dispatch physics update event
      this.dispatchPhysicsUpdate();
    }
  }

  private dispatchPhysicsUpdate(): void {
    if (!this.animationData) return;
    
    const currentTime = this.engine.timing.timestamp / 1000 - this.startTime;
    
    // Get first body for height/velocity display (you can modify this logic)
    const firstBody = Array.from(this.bodies.values())[0];
    
    const physicsData = {
      height: firstBody ? Math.abs(firstBody.position.y - this.canvas.clientHeight * 0.5) / 100 : 0,
      velocity: firstBody ? Math.sqrt(firstBody.velocity.x ** 2 + firstBody.velocity.y ** 2) / 20 : 0,
      time: currentTime,
      phase: this.hasCollided ? 2 : 1,
      timeScale: this.timeScale,
      isPaused: this.isPaused
    };
    
    const event = new CustomEvent('physicsUpdate', { detail: physicsData });
    window.dispatchEvent(event);
  }

  public startAnimation(): void {
    if (this.animationStarted) return;
    
    this.animationStarted = true;
    this.startTime = this.engine.timing.timestamp / 1000;
    this.hasCollided = false;
    
    // Start the physics engine
    Matter.Runner.run(this.runner, this.engine);
    
    // Setup regular physics updates
    const updateInterval = setInterval(() => {
      if (!this.animationStarted) {
        clearInterval(updateInterval);
        return;
      }
      this.dispatchPhysicsUpdate();
    }, 50); // Update every 50ms
    
    console.log('Animation started');
  }

  public resetAnimation(): void {
    this.animationStarted = false;
    this.hasCollided = false;
    this.isPaused = false;
    this.timeScale = 1.0;
    
    // Stop the runner
    Matter.Runner.stop(this.runner);
    
    // Clear existing bodies
    Matter.World.clear(this.world, false);
    this.bodies.clear();
    
    // Recreate physics
    this.setupPhysics();
    this.setupCollisions();
    
    console.log('Animation reset');
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
    
    // Stop everything
    Matter.Runner.stop(this.runner);
    Matter.Render.stop(this.render);
    
    // Clear the world
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
    
    // Clear references
    this.bodies.clear();
    
    console.log('MatterManager cleaned up');
  }
}

export default MatterManager;