import Matter from "matter-js";

// Color mapping similar to Manim's COLOR_MAP
const COLOR_MAP: { [key: string]: string } = {
  "RED": "#FF0000",
  "GREEN": "#00FF00",
  "BLUE": "#0000FF",
  "YELLOW": "#FFFF00",
  "WHITE": "#FFFFFF",
  "BLACK": "#000000",
  "PURPLE": "#800080",
  "ORANGE": "#FFA500",
  "PINK": "#FFC0CB",
  "TEAL": "#008080",
  "null": "#FF0000", // Default to RED if color is null
};

interface PhysicsPhase {
  startTime: number;
  duration: number;
  endTime: number;
  initialPosition: number;
  initialVelocity: number;
  acceleration: number;
  color: string;
}

interface PhysicsUpdate {
  height: number;
  velocity: number;
  time: number;
  phase: number;
}

// Extend the Window interface to include our custom properties
declare global {
  interface Window {
    ANIMATION_DATA?: string;
    NUM_MOTIONS?: string;
  }
}

class MatterManager {
  private canvas: HTMLCanvasElement;
  private engine: Matter.Engine;
  private render: Matter.Render;
  private ball: Matter.Body | null;
  private ground: Matter.Body | null;
  private phases: PhysicsPhase[];
  private currentPhase: number;
  private startTime: number;
  private isAnimating: boolean;
  private animationId: number | null;
  private readonly PIXELS_PER_METER: number;
  private readonly DEFAULT_GRAVITY: number;
  private groundHeight: number;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    console.log("Initializing MatterManager...");
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // Initialize Matter.js but we'll use custom rendering
    this.engine = Matter.Engine.create();
    this.engine.world.gravity.y = 0; // We'll handle gravity manually
    
    this.render = Matter.Render.create({
      canvas: canvas,
      engine: this.engine,
      options: {
        width: canvas.clientWidth,
        height: canvas.clientHeight,
        wireframes: false,
        background: "transparent", // We'll handle background in custom rendering
        showAngleIndicator: false,
        showVelocity: false,
        showDebug: false,
      },
    });

    this.ball = null;
    this.ground = null;
    this.phases = [];
    this.currentPhase = 0;
    this.startTime = 0;
    this.isAnimating = false;
    this.animationId = null;
    this.groundHeight = 60;
    
    // Physics constants
    this.PIXELS_PER_METER = 50; // Conversion factor
    this.DEFAULT_GRAVITY = 9.8;
    
    this.setupWorld();
    console.log("MatterManager initialized successfully");
  }

  setupWorld(): void {
    try {
      // Setup canvas
      this.setupCanvas();
      
      // Create ground (for physics reference, but we'll render custom)
      this.ground = Matter.Bodies.rectangle(
        this.canvas.clientWidth / 2,
        this.canvas.clientHeight - this.groundHeight / 2,
        this.canvas.clientWidth,
        this.groundHeight,
        { 
          isStatic: true, 
          render: { fillStyle: "#2C3E50" },
          label: "ground"
        }
      );

      // Create ball (for physics reference, but we'll render custom)
      this.ball = Matter.Bodies.circle(
        this.canvas.clientWidth / 2,
        this.canvas.clientHeight - this.groundHeight - 50, // Start above ground
        20, // radius
        {
          render: { 
            fillStyle: COLOR_MAP.RED,
            strokeStyle: "#FFFFFF",
            lineWidth: 2
          },
          frictionAir: 0,
          friction: 0,
          restitution: 0,
          label: "ball"
        }
      );

      Matter.World.add(this.engine.world, [this.ground, this.ball]);
      
      // Don't start Matter.js rendering - we'll do custom rendering
      Matter.Engine.run(this.engine);
      
      // Initial render
      this.drawInitialScene();
      
      console.log("World setup completed");
    } catch (error) {
      console.error("Error setting up world:", error);
      throw error;
    }
  }

  setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.ctx.imageSmoothingEnabled = true;
  }

  drawScene(ballY: number, phase: number): void {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas
    ctx.fillStyle = "rgba(20, 20, 30, 0.95)";
    ctx.fillRect(0, 0, width, height);

    // Draw ground
    ctx.fillStyle = "#2C3E50";
    ctx.fillRect(0, height - this.groundHeight, width, this.groundHeight);

    // Draw ground line
    ctx.strokeStyle = "#34495E";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height - this.groundHeight);
    ctx.lineTo(width, height - this.groundHeight);
    ctx.stroke();

    // Draw height markers
    ctx.strokeStyle = "#4A5568";
    ctx.lineWidth = 1;
    ctx.font = "12px Arial";
    ctx.fillStyle = "#A0ADB8";
    
    for (let i = 1; i <= 6; i++) {
      const y = height - this.groundHeight - (i * this.PIXELS_PER_METER);
      if (y > 0) {
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillText(`${i}m`, 10, y - 5);
      }
    }

    // Draw ball
    const ballX = width / 2;
    const ballRadius = 20;
    const currentPhase = this.phases[phase] || (this.phases.length > 0 ? this.phases[0] : null);
    
    if (currentPhase) {
      // Ball shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(ballX, height - this.groundHeight + 5, ballRadius * 0.8, 8, 0, 0, 2 * Math.PI);
      ctx.fill();

      // Ball
      ctx.fillStyle = currentPhase.color;
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Ball highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(ballX - 6, ballY - 6, 6, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  drawInitialScene(): void {
    if (this.phases.length > 0) {
      const initialHeight = this.phases[0].initialPosition * this.PIXELS_PER_METER;
      const screenY = this.canvas.height - this.groundHeight - initialHeight;
      this.drawScene(screenY, 0);
    } else {
      // Draw default scene
      const defaultY = this.canvas.height - this.groundHeight - (5 * this.PIXELS_PER_METER);
      this.drawScene(defaultY, 0);
    }
  }

  parseAnimationData(): boolean {
    try {
      console.log("Parsing animation data...");
      console.log("Window ANIMATION_DATA:", window.ANIMATION_DATA);
      console.log("Window NUM_MOTIONS:", window.NUM_MOTIONS);
      
      // Parse animation data from window object
      const animationDataStr = window.ANIMATION_DATA || "{}";
      let animationData;
      
      try {
        animationData = JSON.parse(animationDataStr);
      } catch (parseError) {
        console.error("Failed to parse animation data JSON:", parseError);
        animationData = {};
      }
      
      const motionCount = parseInt(window.NUM_MOTIONS || "0");
      console.log("Motion count:", motionCount);

      if (motionCount === 0 || !animationData || Object.keys(animationData).length === 0) {
        console.log("No motions found or empty data, creating default animation");
        this.createDefaultAnimation();
        return true;
      }

      // Parse motion phases similar to backend format
      const motions: any[] = [];
      for (let i = 1; i <= motionCount; i++) {
        const prefix = `${i}_`;
        const phaseData: any = {};
        
        for (const [key, value] of Object.entries(animationData)) {
          if (key.startsWith(prefix)) {
            const cleanKey = key.substring(prefix.length);
            phaseData[cleanKey] = value;
          }
        }
        
        if (Object.keys(phaseData).length > 0) {
          motions.push(phaseData);
          console.log(`Motion ${i}:`, phaseData);
        }
      }

      // Convert to physics phases
      this.phases = [];
      let totalTime = 0;

      for (const motion of motions) {
        // Parse values with better error handling
        const parseFloat_safe = (value: any, defaultValue: number = 0): number => {
          if (value === null || value === undefined || value === "null") {
            return defaultValue;
          }
          const parsed = parseFloat(String(value));
          return isNaN(parsed) ? defaultValue : parsed;
        };

        const z0 = parseFloat_safe(motion.initial_position, 0);
        const v0 = parseFloat_safe(motion.initial_velocity, 0);
        const a = parseFloat_safe(motion.acceleration, this.DEFAULT_GRAVITY);
        const duration = parseFloat_safe(motion.time, 1.0);
        const color = motion.color || "RED";

        this.phases.push({
          startTime: totalTime,
          duration: Math.max(duration, 0.1), // Minimum duration
          endTime: totalTime + duration,
          initialPosition: Math.abs(z0), // Ensure positive height
          initialVelocity: v0,
          acceleration: Math.abs(a), // Ensure positive acceleration for falling
          color: COLOR_MAP[String(color).toUpperCase()] || COLOR_MAP.RED
        });

        totalTime += duration;
      }

      console.log("Parsed phases:", this.phases);
      return this.phases.length > 0;
    } catch (error) {
      console.error("Error parsing animation data:", error);
      // Create default animation if parsing fails
      this.createDefaultAnimation();
      return true;
    }
  }

  createDefaultAnimation(): void {
    console.log("Creating default animation");
    // Default bouncing ball animation
    this.phases = [
      {
        startTime: 0,
        duration: 1.01,
        endTime: 1.01,
        initialPosition: 5, // meters
        initialVelocity: 0,
        acceleration: 9.8,
        color: COLOR_MAP.RED
      },
      {
        startTime: 1.01,
        duration: 0.78,
        endTime: 1.79,
        initialPosition: 0,
        initialVelocity: 7.67,
        acceleration: 9.8,
        color: COLOR_MAP.BLUE
      },
      {
        startTime: 1.79,
        duration: 0.78,
        endTime: 2.57,
        initialPosition: 3,
        initialVelocity: 0,
        acceleration: 9.8,
        color: COLOR_MAP.GREEN
      },
      {
        startTime: 2.57,
        duration: 0.61,
        endTime: 3.18,
        initialPosition: 0,
        initialVelocity: 5.94,
        acceleration: 9.8,
        color: COLOR_MAP.YELLOW
      }
    ];
  }

  startAnimation(): void {
    console.log("Starting animation...");
    if (this.isAnimating) {
      this.stopAnimation();
    }

    if (!this.parseAnimationData()) {
      console.error("Failed to parse animation data");
      return;
    }

    this.isAnimating = true;
    this.currentPhase = 0;
    this.startTime = Date.now();
    
    // Initial render
    this.drawInitialScene();
    
    this.animatePhases();
  }

  animatePhases(): void {
    if (!this.isAnimating || this.currentPhase >= this.phases.length) {
      console.log("Animation completed or stopped");
      this.stopAnimation();
      return;
    }

    const currentTime = (Date.now() - this.startTime) / 1000; // Convert to seconds
    const phase = this.phases[this.currentPhase];
    
    // Check if we should move to next phase
    if (currentTime >= phase.endTime) {
      this.currentPhase++;
      if (this.currentPhase < this.phases.length) {
        console.log(`Moving to phase ${this.currentPhase + 1}`);
      }
      this.animationId = requestAnimationFrame(() => this.animatePhases());
      return;
    }

    // Calculate physics for current phase
    const phaseTime = currentTime - phase.startTime;
    
    if (phaseTime >= 0 && phaseTime <= phase.duration) {
      // Physics calculations (kinematic equations)
      // z = z0 + v0*t - 0.5*a*t^2 (for falling motion)
      let z: number;
      let velocity: number;

      if (phase.initialVelocity >= 0) {
        // Upward motion or starting from rest
        z = phase.initialPosition + 
            phase.initialVelocity * phaseTime - 
            0.5 * phase.acceleration * phaseTime * phaseTime;
        velocity = phase.initialVelocity - phase.acceleration * phaseTime;
      } else {
        // Downward motion
        z = phase.initialPosition + 
            phase.initialVelocity * phaseTime - 
            0.5 * phase.acceleration * phaseTime * phaseTime;
        velocity = phase.initialVelocity - phase.acceleration * phaseTime;
      }
      
      // Convert from physics units to screen coordinates
      // Ensure ball doesn't go below ground
      const physicsHeight = Math.max(z, 0);
      const screenY = this.canvas.height - this.groundHeight - (physicsHeight * this.PIXELS_PER_METER);
      
      // Custom rendering
      this.drawScene(screenY, this.currentPhase);
      
      // Emit events for UI updates
      this.emitPhysicsUpdate({
        height: physicsHeight,
        velocity: velocity,
        time: currentTime,
        phase: this.currentPhase + 1
      });
    }

    this.animationId = requestAnimationFrame(() => this.animatePhases());
  }

  emitPhysicsUpdate(data: PhysicsUpdate): void {
    // Dispatch custom event for UI components to listen to
    try {
      const event = new CustomEvent('physicsUpdate', { detail: data });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error emitting physics update:", error);
    }
  }

  stopAnimation(): void {
    console.log("Stopping animation");
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resetAnimation(): void {
    console.log("Resetting animation");
    this.stopAnimation();
    this.currentPhase = 0;
    
    // Parse data to ensure phases are available
    this.parseAnimationData();
    
    // Reset to initial position and render
    this.drawInitialScene();
    
    // Reset physics data display
    const initialData = this.phases.length > 0 ? {
      height: this.phases[0].initialPosition,
      velocity: this.phases[0].initialVelocity,
      time: 0,
      phase: 1
    } : {
      height: 5,
      velocity: 0,
      time: 0,
      phase: 1
    };
    
    this.emitPhysicsUpdate(initialData);
  }

  resize(): void {
    try {
      this.setupCanvas();

      // Update ground position (for physics reference)
      if (this.ground) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        Matter.Body.setPosition(this.ground, {
          x: width / 2,
          y: height - this.groundHeight / 2
        });
      }

      // Re-render scene
      if (!this.isAnimating) {
        this.drawInitialScene();
      }

    } catch (error) {
      console.error("Error during resize:", error);
    }
  }

  cleanup(): void {
    console.log("Cleaning up MatterManager");
    try {
      this.stopAnimation();
      Matter.Render.stop(this.render);
      Matter.Engine.clear(this.engine);
      if (this.render.canvas) {
        // Don't remove canvas as it's managed by React
      }
      this.render.textures = {};
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }
}

export default MatterManager;