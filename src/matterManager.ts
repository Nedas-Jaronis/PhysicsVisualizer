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
  restitutionCoeff: number;
  phaseType: 'fall' | 'rise'; // Track if ball is falling or rising
  bounceNumber?: number; // Track which bounce this is
}

interface PhysicsUpdate {
  height: number;
  velocity: number;
  time: number;
  phase: number;
  velocityBeforeImpact?: number;
  velocityAfterImpact?: number;
  bounceHeight?: number;
  timeScale: number; // Add time scale to physics update
  isPaused: boolean; // Add pause state to physics update
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
  private totalPausedDuration: number; // Track total time spent paused
  private lastPauseTime: number; // Track when pause started
  private isAnimating: boolean;
  private isPaused: boolean; // Add pause state
  private readonly PIXELS_PER_METER: number;
  private readonly DEFAULT_GRAVITY: number;
  private groundHeight: number;
  private ctx: CanvasRenderingContext2D;
  private timeScale: number; // Time scale factor (1.0 = normal, 0.5 = half speed, 2.0 = double speed)

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
    this.totalPausedDuration = 0;
    this.lastPauseTime = 0;
    this.isAnimating = false;
    this.isPaused = false;
    this.groundHeight = 60;
    this.timeScale = 1.0; // Normal speed by default
    
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
    
    for (let i = 1; i <= 12; i++) {
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

      // Draw pause indicator if paused
      if (this.isPaused) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("⏸", ballX, ballY + 15);
        ctx.textAlign = "left"; // Reset text align
      }
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

  /**
   * Generate bouncing phases based on initial drop and restitution coefficient
   */
  generateBouncingPhases(initialHeight: number, restitutionCoeff: number, gravity: number = 9.8, maxBounces: number = 5): PhysicsPhase[] {
    const phases: PhysicsPhase[] = [];
    let currentTime = 0;
    let currentHeight = initialHeight;
    let currentVelocity = 0;
    const colors = [COLOR_MAP.RED, COLOR_MAP.BLUE, COLOR_MAP.GREEN, COLOR_MAP.YELLOW, COLOR_MAP.PURPLE, COLOR_MAP.ORANGE];
    
    console.log(`Generating bouncing phases: height=${initialHeight}m, e=${restitutionCoeff}, g=${gravity}`);

    for (let bounce = 0; bounce <= maxBounces; bounce++) {
      if (bounce === 0) {
        // Initial fall from rest
        const fallTime = Math.sqrt(2 * currentHeight / gravity);
        const velocityBeforeImpact = Math.sqrt(2 * gravity * currentHeight);
        
        phases.push({
          startTime: currentTime,
          duration: fallTime,
          endTime: currentTime + fallTime,
          initialPosition: currentHeight,
          initialVelocity: 0,
          acceleration: gravity,
          color: colors[bounce % colors.length],
          restitutionCoeff: restitutionCoeff,
          phaseType: 'fall',
          bounceNumber: bounce + 1
        });
        
        currentTime += fallTime;
        currentVelocity = velocityBeforeImpact * restitutionCoeff; // Velocity after bounce
        currentHeight = (currentVelocity * currentVelocity) / (2 * gravity); // New bounce height
        
        console.log(`Bounce ${bounce + 1}: Fall time=${fallTime.toFixed(3)}s, v_before=${velocityBeforeImpact.toFixed(2)}m/s, v_after=${currentVelocity.toFixed(2)}m/s, next_height=${currentHeight.toFixed(2)}m`);
        
        // Stop if bounce height is too small
        if (currentHeight < 0.1) break;
        
      } else {
        // Rise phase
        const riseTime = currentVelocity / gravity;
        
        phases.push({
          startTime: currentTime,
          duration: riseTime,
          endTime: currentTime + riseTime,
          initialPosition: 0,
          initialVelocity: currentVelocity,
          acceleration: gravity,
          color: colors[bounce % colors.length],
          restitutionCoeff: restitutionCoeff,
          phaseType: 'rise',
          bounceNumber: bounce + 1
        });
        
        currentTime += riseTime;
        
        // Fall phase
        const fallTime = riseTime; // Same time to fall as to rise
        const velocityBeforeImpact = currentVelocity; // Same magnitude as initial rise velocity
        
        phases.push({
          startTime: currentTime,
          duration: fallTime,
          endTime: currentTime + fallTime,
          initialPosition: currentHeight,
          initialVelocity: 0,
          acceleration: gravity,
          color: colors[bounce % colors.length],
          restitutionCoeff: restitutionCoeff,
          phaseType: 'fall',
          bounceNumber: bounce + 1
        });
        
        currentTime += fallTime;
        currentVelocity = velocityBeforeImpact * restitutionCoeff; // Velocity after bounce
        currentHeight = (currentVelocity * currentVelocity) / (2 * gravity); // New bounce height
        
        console.log(`Bounce ${bounce + 1}: Rise time=${riseTime.toFixed(3)}s, Fall time=${fallTime.toFixed(3)}s, v_before=${velocityBeforeImpact.toFixed(2)}m/s, v_after=${currentVelocity.toFixed(2)}m/s, next_height=${currentHeight.toFixed(2)}m`);
        
        // Stop if bounce height is too small
        if (currentHeight < 0.1) break;
      }
    }
    
    return phases;
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

      // Check if this is a bouncing problem (has restitution coefficient)
      const hasRestitution = motions.some(motion => 
        motion.restitution_coeff !== undefined && 
        motion.restitution_coeff !== null && 
        parseFloat(String(motion.restitution_coeff)) > 0
      );

      if (hasRestitution && motions.length > 0) {
        // Generate bouncing phases automatically
        const firstMotion = motions[0];
        const parseFloat_safe = (value: any, defaultValue: number = 0): number => {
          if (value === null || value === undefined || value === "null") {
            return defaultValue;
          }
          const parsed = parseFloat(String(value));
          return isNaN(parsed) ? defaultValue : parsed;
        };

        const initialHeight = parseFloat_safe(firstMotion.initial_position, 10);
        const restitutionCoeff = parseFloat_safe(firstMotion.restitution_coeff, 0.7);
        const gravity = parseFloat_safe(firstMotion.acceleration, this.DEFAULT_GRAVITY);
        
        console.log(`Detected bouncing problem: h=${initialHeight}m, e=${restitutionCoeff}, g=${gravity}m/s²`);
        
        this.phases = this.generateBouncingPhases(initialHeight, restitutionCoeff, gravity);
        
      } else {
        // Convert to physics phases (original behavior)
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
          const restitutionCoeff = parseFloat_safe(motion.restitution_coeff, 0);

          this.phases.push({
            startTime: totalTime,
            duration: Math.max(duration, 0.1), // Minimum duration
            endTime: totalTime + duration,
            initialPosition: Math.abs(z0), // Ensure positive height
            initialVelocity: v0,
            acceleration: Math.abs(a), // Ensure positive acceleration for falling
            color: COLOR_MAP[String(color).toUpperCase()] || COLOR_MAP.RED,
            restitutionCoeff: restitutionCoeff,
            phaseType: v0 >= 0 ? 'rise' : 'fall'
          });

          totalTime += duration;
        }
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
    console.log("Creating default bouncing animation");
    // Default bouncing ball animation with restitution
    this.phases = this.generateBouncingPhases(10, 0.7, 9.8, 4);
  }

  // New methods for time scale control
  setTimeScale(scale: number): void {
    console.log(`Setting time scale to: ${scale}x`);
    this.timeScale = Math.max(0.1, Math.min(scale, 5.0)); // Clamp between 0.1x and 5.0x
  }

  getTimeScale(): number {
    return this.timeScale;
  }

  toggleSlowMotion(): void {
    if (this.timeScale === 1.0) {
      this.setTimeScale(0.25); // Quarter speed
    } else {
      this.setTimeScale(1.0); // Normal speed
    }
  }

  // New pause/resume functionality
  pauseAnimation(): void {
    if (this.isAnimating && !this.isPaused) {
      console.log("Pausing animation");
      this.isPaused = true;
      this.lastPauseTime = Date.now();
      
      // Emit physics update with pause state
      this.emitCurrentPhysicsUpdate();
    }
  }

  resumeAnimation(): void {
    if (this.isAnimating && this.isPaused) {
      console.log("Resuming animation");
      this.isPaused = false;
      
      // Add the paused duration to total paused time
      const pauseDuration = (Date.now() - this.lastPauseTime) / 1000;
      this.totalPausedDuration += pauseDuration;
      
      // Emit physics update with resume state
      this.emitCurrentPhysicsUpdate();
    }
  }

  togglePause(): void {
    if (this.isPaused) {
      this.resumeAnimation();
    } else {
      this.pauseAnimation();
    }
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  private emitCurrentPhysicsUpdate(): void {
    if (this.currentPhase < this.phases.length) {
      const phase = this.phases[this.currentPhase];
      const realElapsedTime = (Date.now() - this.startTime) / 1000;
      const adjustedElapsedTime = (realElapsedTime - this.totalPausedDuration) * this.timeScale;
      const phaseTime = adjustedElapsedTime - phase.startTime;
      
      // Calculate current physics state
      let z: number;
      let velocity: number;

      if (phase.phaseType === 'rise') {
        z = phase.initialPosition + 
            phase.initialVelocity * phaseTime - 
            0.5 * phase.acceleration * phaseTime * phaseTime;
        velocity = phase.initialVelocity - phase.acceleration * phaseTime;
      } else {
        if (phase.initialVelocity === 0) {
          z = phase.initialPosition - 0.5 * phase.acceleration * phaseTime * phaseTime;
          velocity = -phase.acceleration * phaseTime;
        } else {
          z = phase.initialPosition + 
              phase.initialVelocity * phaseTime + 
              0.5 * phase.acceleration * phaseTime * phaseTime;
          velocity = phase.initialVelocity + phase.acceleration * phaseTime;
        }
      }

      const physicsHeight = Math.max(z, 0);
      
      this.emitPhysicsUpdate({
        height: physicsHeight,
        velocity: velocity,
        time: adjustedElapsedTime,
        phase: this.currentPhase + 1,
        timeScale: this.timeScale,
        isPaused: this.isPaused
      });
    }
  }

  startAnimation(): void {
    console.log("Starting animation...");
    if (this.isAnimating) {
      this.pauseAnimation();
    }

    if (!this.parseAnimationData()) {
      console.error("Failed to parse animation data");
      return;
    }

    this.isAnimating = true;
    this.isPaused = false;
    this.currentPhase = 0;
    this.startTime = Date.now();
    this.pausedTime = 0;
    this.totalPausedDuration = 0;
    this.lastPauseTime = 0;
    
    // Initial render
    this.drawInitialScene();
    
    this.animatePhases();
  }

  animatePhases(): void {
    if (!this.isAnimating || this.currentPhase >= this.phases.length) {
      console.log("Animation completed or stopped");
      this.pauseAnimation();
      return;
    }

    // If paused, just re-render current frame and schedule next frame
    if (this.isPaused) {
      this.animationId = requestAnimationFrame(() => this.animatePhases());
      return;
    }

    // Apply time scale to the elapsed time, accounting for paused time
    const realElapsedTime = (Date.now() - this.startTime) / 1000;
    const adjustedElapsedTime = (realElapsedTime - this.totalPausedDuration) * this.timeScale;
    const currentTime = adjustedElapsedTime;
    
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
      let z: number;
      let velocity: number;

      if (phase.phaseType === 'rise') {
        // Rising motion: z = z0 + v0*t - 0.5*g*t^2
        z = phase.initialPosition + 
            phase.initialVelocity * phaseTime - 
            0.5 * phase.acceleration * phaseTime * phaseTime;
        velocity = phase.initialVelocity - phase.acceleration * phaseTime;
      } else {
        // Falling motion: z = z0 + v0*t + 0.5*g*t^2 (if v0 is negative) or z = z0 - 0.5*g*t^2 (from rest)
        if (phase.initialVelocity === 0) {
          // Falling from rest
          z = phase.initialPosition - 0.5 * phase.acceleration * phaseTime * phaseTime;
          velocity = -phase.acceleration * phaseTime; // Negative because falling
        } else {
          // Falling with initial velocity
          z = phase.initialPosition + 
              phase.initialVelocity * phaseTime + 
              0.5 * phase.acceleration * phaseTime * phaseTime;
          velocity = phase.initialVelocity + phase.acceleration * phaseTime;
        }
      }
      
      // Convert from physics units to screen coordinates
      // Ensure ball doesn't go below ground
      const physicsHeight = Math.max(z, 0);
      const screenY = this.canvas.height - this.groundHeight - (physicsHeight * this.PIXELS_PER_METER);
      
      // Custom rendering
      this.drawScene(screenY, this.currentPhase);
      
      // Calculate impact velocities for bouncing phases
      let velocityBeforeImpact: number | undefined;
      let velocityAfterImpact: number | undefined;
      let bounceHeight: number | undefined;
      
      if (phase.phaseType === 'fall' && Math.abs(phaseTime - phase.duration) < 0.01) {
        // Just before impact
        velocityBeforeImpact = Math.abs(velocity);
        velocityAfterImpact = velocityBeforeImpact * phase.restitutionCoeff;
        bounceHeight = (velocityAfterImpact * velocityAfterImpact) / (2 * phase.acceleration);
      }
      
      // Emit events for UI updates
      this.emitPhysicsUpdate({
        height: physicsHeight,
        velocity: velocity,
        time: currentTime,
        phase: this.currentPhase + 1,
        velocityBeforeImpact,
        velocityAfterImpact,
        bounceHeight,
        timeScale: this.timeScale,
        isPaused: this.isPaused
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

  resetAnimation(): void {
    console.log("Resetting animation");
    this.currentPhase = 0;
    this.totalPausedDuration = 0;
    this.lastPauseTime = 0;
    
    // Parse data to ensure phases are available
    this.parseAnimationData();
    
    // Reset to initial position and render
    this.drawInitialScene();
    
    // Reset physics data display
    const initialData = this.phases.length > 0 ? {
      height: this.phases[0].initialPosition,
      velocity: this.phases[0].initialVelocity,
      time: 0,
      phase: 1,
      timeScale: this.timeScale,
      isPaused: false
    } : {
      height: 10,
      velocity: 0,
      time: 0,
      phase: 1,
      timeScale: this.timeScale,
      isPaused: false
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