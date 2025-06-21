import Matter from "matter-js";
import { env } from "process";
// import * as fieldsInterface from "./types/fieldInterface";
// import * as forcesInterface from "./types/forceInterface";
// import * as interactionsInterface from "./types/interactionInterface";
// import * as materialsInterface from "./types/materialsInterface";
// import * as motionsInterface from "./types/motionInterface";
import { Object as PhysicsObject } from "./types/objectInterface";
import { getEnvironmentData } from "worker_threads";
// import * as environmentInterface from "./types/environmentInterface";

// Color mapping
// const COLOR_MAP: { [key: string]: string } = {
//   RED: "#FF0000",
//   GREEN: "#00FF00",
//   BLUE: "#0000FF",
//   YELLOW: "#FFFF00",
//   WHITE: "#FFFFFF",
//   BLACK: "#000000",
//   PURPLE: "#800080",
//   ORANGE: "#FFA500",
//   PINK: "#FFC0CB",
//   TEAL: "#008080",
// };

interface ForceData {
  type: string;
  magnitude?: number;
  direction: string;
  source?: string;
  applied_to: string;
}

type ObjectData = PhysicsObject;

interface AnimationData {
  forces?: ForceData[];
  objects?: ObjectData[];
  motions?: any[];
  interactions?: any[];
  fields?: any[];
  materials?: any[];
  environments?: any[];
}

function toCanvasCoords(x: number, y: number, canvasWidth: number, canvasHeight: number) {
    const CenterWidth = canvasWidth / 2;
    const CenterHeight = canvasHeight /2;
  return {
    
    x: (CenterWidth + x),
    y:  (CenterHeight - y)
  };
}



class MatterManager {
  private canvas: HTMLCanvasElement;
  private engine: Matter.Engine;
  private world: Matter.World;
  private render: Matter.Render;
  private runner: Matter.Runner;
  private bodies: Map<string, Matter.Body> = new Map();
  private constraints: Map<string, Matter.Constraint> = new Map();
  private timeScale: number = 0.1; // Much slower default speed
  private isPaused: boolean = false;
  private forceUpdateHandler: (() => void) | null = null;
  private renderContext: CanvasRenderingContext2D | null = null;
  private animationData: AnimationData | null = null;
  private scale: number = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderContext = canvas.getContext('2d');

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

    // Create runner with much slower timing
    this.runner = Matter.Runner.create({
      delta: 16.666, // ~60 FPS
      isFixed: true
    });

    // Set initial slow speed
    this.engine.timing.timeScale = this.timeScale;

    // Load animation data from window object
    this.loadAnimationData();

    // Start rendering
    Matter.Render.run(this.render);

    // Add custom rendering for force arrows
    Matter.Events.on(this.render, 'afterRender', () => {
      this.drawForceArrows();
      this.drawObjectLabels();
    });
  }
  

  
  private setupWorld(): void {
    const canvasWidth: number = this.canvas.clientWidth;
    const canvasHeight: number = this.canvas.clientHeight;
    const data = this.animationData
    const scale = this.scale;


    if (!data) {
      console.warn("No animation data available to setupWorld");
      return
    }

    const environmentBodies: Matter.Body[] = [];

    if (data.environments && Array.isArray(data.environments)){
      data.environments.forEach(environment => {
        if(!environment || typeof environment !== "object" || !environment.type) return;

        switch (environment.type) {
          case "ground":
            const groundX = (environment.position?.x ?? canvasWidth / 2) * scale;
            const groundWidth =( environment.width ?? canvasWidth) * scale;
            const groundHeight_ = (environment?.height ?? 20) * scale;
            const groundY = (environment.position?.y ?? 0) * scale;

            const { x, y } = toCanvasCoords(groundX, groundY, canvasWidth, canvasHeight);
 
            const ground = Matter.Bodies.rectangle(
              x,
              y,
              groundWidth,
              groundHeight_,
              {
                isStatic: true,
                friction: environment.friction?.kinetic ?? 0,
                render: {
                  fillStyle: '#FF00FF',
                  strokeStyle: '#654321',
                  lineWidth: 3
                }
              }
            );
            console.log("Ground created at:", x, y, "with width", groundWidth, "and thickness", groundHeight_);

            environmentBodies.push(ground);
            break;

          case "incline":
            const angleDegrees = environment.angle ?? 30;
            const angleRadians = angleDegrees * (Math.PI / 100);

            const inclineX = (environment.position?.x ?? 0) * scale;
            const inclineY = (environment.position?.y ?? 0) * scale;
            const { x: InclineX, y: InclineY } = toCanvasCoords(inclineX, inclineY, canvasWidth, canvasHeight);


            const length = (environment.length ?? 200)*scale;
            const width = (environment.width ?? 30) * scale;

            const frictionKinetic = environment.friction?.kinetic?? 0;
            const frictionStatic = environment.friction?.static ?? 0;

            const incline = Matter.Bodies.rectangle(
              InclineX,
              InclineY,
              length,
              width,
              {
                isStatic: true,
                angle: angleRadians,
                friction: frictionKinetic,
                frictionStatic: frictionStatic,
                render: {
                  fillStyle: '#999999',
                  strokeStyle: '#666666',
                  lineWidth: 2
                }
              }
            );

            environmentBodies.push(incline);
            break;

          case "cliff":

            const cliffWidth = (environment.width ?? 150) * scale;
            const cliffHeight = (environment.height ?? 150) * scale;

            let cliffY: number;
            
            const groundCliff = data.environments?.find(env => env.type === "ground");
            if(groundCliff){
              const groundH = (groundCliff?.height ?? 20) * scale;
              const groundYCliff = (groundCliff?.position?.y ?? 0) * scale;
              
              const groundTopYCoord = groundYCliff + groundH / 2;
              cliffY = groundTopYCoord + cliffHeight / 2;
            } else{
              cliffY = (environment.position?.y ?? canvasHeight - 150) * scale;
            }
            
            let cliffX: number;
            cliffX = (environment.position?.x ?? canvasWidth / 2) * scale;


            const edgeCliff = environment.edge ?? "right";
            const groundWCliff = (groundCliff.width ?? 0);
            if(edgeCliff == "right"){
              cliffX = ((groundWCliff / 2) - environment.width / 2) * scale;
            } else if (edgeCliff == "left"){
              cliffX = -((groundWCliff / 2) - environment.width / 2) * scale
            } else{
              cliffX = (environment.position?.x ?? canvasWidth) * scale;
            }


            const { x: cliff_X, y: cliff_Y} = toCanvasCoords (cliffX, cliffY, canvasWidth, canvasHeight);



            const cliff = Matter.Bodies.rectangle(
              cliff_X,
              cliff_Y,
              cliffWidth,
              cliffHeight,
              {
                isStatic: true,
                friction: 0.6,
                render:{
                  fillStyle: environment.material === "rock" ? '#7B6F50' : '#885E3D',
                  strokeStyle: '#5A4B31',
                  lineWidth: 3,
                }
              }
            );

            environmentBodies.push(cliff);
            break;

          case "wall":
          
          
          
          const wallWidth = (environment.width ?? 50) * scale;
          const wallHeight = (environment.height ?? 200) * scale;
          const wallThickness = (environment.thickness ?? 0.5) * scale;
          
          let wallY: number;
          //Wall Properties
          const ground_ = data.environments?.find(env => env.type === "ground");
          if(ground_){
            const groundHeight = (ground_?.height ?? 20) * scale;
            const groundYCoord = (ground_?.position?.y ?? 0) * scale;
            
            const groundTopY = groundYCoord + groundHeight / 2;
            wallY = groundTopY + wallHeight / 2;
          } else{
            wallY = (environment.position?.y ?? canvasHeight / 2) * scale
          }
          let wallX: number;
          const edge = environment.edge ?? "right";
          const groundW = (ground_.width ?? 0);
          if(edge == "right"){
            wallX = ((groundW / 2) - environment.width / 2) * scale;
          } else if (edge == "left"){
            wallX = -((groundW / 2) - environment.width / 2) * scale
          } else{
            wallX = (environment.position?.x ?? canvasWidth) * scale;
          }
            
            const { x: wall_X, y: wall_Y } = toCanvasCoords (wallX, wallY, canvasWidth, canvasHeight);

            const wall = Matter.Bodies.rectangle(
              wall_X,
              wall_Y,
              wallWidth,
              wallHeight,
              {
                isStatic: true,
                friction: 0.4,
                restitution: environment.isReflective ? 0.9 : 0.1, // High restitution if reflective
                render: {
                  fillStyle: environment.material === "metal" ? "#A9A9A9" : "#888888",
                  strokeStyle: "#555555",
                  lineWidth: 2
                }
              }
            );
            console.log("Wall created at", wall_X, "hi", wall_Y);
            environmentBodies.push(wall);
            break;
        }
      });
    }

    if(environmentBodies.length > 0) {
      Matter.World.add(this.world, environmentBodies);
      console.log("I had this many bodies", environmentBodies.length);
    }
    console.log("This many", environmentBodies.length);
    console.log("This is it", environmentBodies);


    const leftWall: Matter.Body = Matter.Bodies.rectangle(
      -30,
      canvasHeight / 2,
      60,
      canvasHeight,
      {
        isStatic: true,
        render: {
          fillStyle: '#666666'
        }
      }
    );

  const rightWall: Matter.Body = Matter.Bodies.rectangle(
    canvasWidth + 30,
    canvasHeight / 2,
    60,
    canvasHeight,
    {
      isStatic: true,
      render: {
        fillStyle: '#666666'
      }
    }
  );

  Matter.World.add(this.world, [leftWall, rightWall]);
  }
  

  private drawForceArrows(): void {
    if (!this.renderContext || !this.animationData) return;

    const ctx: CanvasRenderingContext2D = this.renderContext;
    const data: AnimationData = this.animationData;
    
    if (!data.forces) return;

    const forceMap: Map<string, ForceData[]> = this.buildForceMap(data.forces, data.objects || []);

    forceMap.forEach((forces: ForceData[], objectId: string) => {
      const body: Matter.Body | undefined = this.bodies.get(objectId);
      if (!body) return;

      forces.forEach((force: ForceData, index: number) => {
        if (force && force.type === "applied") {
          this.drawForceArrow(ctx, body, force, index, objectId);
        }
      });
    });

    // Draw force information panel
    this.drawForceInfoPanel(ctx, forceMap);
  }

  private drawForceArrow(
    ctx: CanvasRenderingContext2D,
    body: Matter.Body,
    force: ForceData,
    index: number,
    objectId: string
  ): void {
    const magnitude: number = force.magnitude ?? 0;
    const direction: string = force.direction;
    const source: string = force.source || "unknown";
    const appliedTo: string = force.applied_to || objectId;
    
    // Scale arrow length based on magnitude (more realistic scaling)
    const baseArrowLength: number = 50;
    const arrowLength: number = Math.max(baseArrowLength, Math.min(magnitude * 1.5, 120));
    
    // Position arrows around the object based on direction
    const bodyRadius: number = 25; // Approximate body radius
    let startX: number = body.position.x;
    let startY: number = body.position.y;
    let endX: number = startX;
    let endY: number = startY;
    
    // Offset start position to edge of object based on direction
    switch (direction) {
      case "x":
        startX = body.position.x + bodyRadius;
        startY = body.position.y - (index * 30);
        endX = startX + arrowLength;
        endY = startY;
        break;
      case "-x":
        startX = body.position.x - bodyRadius;
        startY = body.position.y - (index * 30);
        endX = startX - arrowLength;
        endY = startY;
        break;
      case "y":
        startX = body.position.x - (index * 30);
        startY = body.position.y + bodyRadius;
        endX = startX;
        endY = startY + arrowLength;
        break;
      case "-y":
        startX = body.position.x - (index * 30);
        startY = body.position.y - bodyRadius;
        endX = startX;
        endY = startY - arrowLength;
        break;
    }

    // Color code arrows based on source
    let arrowColor: string = '#FF0000'; // Default red
    switch (source) {
      case 'gravity':
        arrowColor = '#0000FF'; // Blue for gravity
        break;
      case 'tension':
        arrowColor = '#00FF00'; // Green for tension
        break;
      case 'normal':
        arrowColor = '#FFA500'; // Orange for normal force
        break;
      case 'friction':
        arrowColor = '#800080'; // Purple for friction
        break;
      case 'applied':
        arrowColor = '#FF0000'; // Red for applied forces
        break;
    }

    // Draw arrow with better styling
    ctx.strokeStyle = arrowColor;
    ctx.fillStyle = arrowColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    // Arrow line with shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Arrow head
    const headLength: number = 15;
    const headAngle: number = Math.PI / 6;
    const angle: number = Math.atan2(endY - startY, endX - startX);
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLength * Math.cos(angle - headAngle),
      endY - headLength * Math.sin(angle - headAngle)
    );
    ctx.lineTo(
      endX - headLength * Math.cos(angle + headAngle),
      endY - headLength * Math.sin(angle + headAngle)
    );
    ctx.closePath();
    ctx.fill();

    // Force label with better formatting
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    
    const labelX: number = startX + (endX - startX) * 0.7;
    const labelY: number = startY + (endY - startY) * 0.7 - 15;
    
    // Draw text outline for better visibility
    ctx.strokeText(`${magnitude}N`, labelX, labelY);
    ctx.fillText(`${magnitude}N`, labelX, labelY);
  }

  private drawObjectLabels(): void {
    if (!this.renderContext) return;

    const ctx: CanvasRenderingContext2D = this.renderContext;
    
    // Draw mass labels on objects
    this.bodies.forEach((body: Matter.Body, id: string) => {
      const massLabel: string = (body as any).massLabel;
      if (massLabel) {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.lineWidth = 2;
        
        // Draw text outline for better visibility
        ctx.strokeText(massLabel, body.position.x, body.position.y + 5);
        ctx.fillText(massLabel, body.position.x, body.position.y + 5);
      }
    });
  }

  private drawForceInfoPanel(ctx: CanvasRenderingContext2D, forceMap: Map<string, ForceData[]>): void {
    // Draw force legend/info panel
    const panelX: number = 10;
    const panelY: number = 10;
    const panelWidth: number = 200;
    let panelHeight: number = 30;
    
    // Calculate panel height based on number of forces
    let totalForces: number = 0;
    forceMap.forEach((forces: ForceData[]) => totalForces += forces.length);
    panelHeight = Math.max(100, 30 + totalForces * 25);
    
    // Draw panel background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Draw panel title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Force Analysis', panelX + 10, panelY + 25);
    
    // Draw force information
    let yOffset: number = 45;
    ctx.font = '12px Arial';
    
    forceMap.forEach((forces: ForceData[], objectId: string) => {
      if (forces.length > 0) {
        ctx.fillStyle = '#333333';
        ctx.fillText(`Object: ${objectId}`, panelX + 10, panelY + yOffset);
        yOffset += 20;
        
        forces.forEach((force: ForceData) => {
          const source: string = force.source || 'unknown';
          const magnitude: number = force.magnitude ?? 0;
          const direction: string = force.direction;
          
          // Color code text based on source
          let textColor: string = '#FF0000';
          switch (source) {
            case 'gravity': 
              textColor = '#0000FF'; 
              break;
            case 'tension': 
              textColor = '#00FF00'; 
              break;
            case 'normal': 
              textColor = '#FFA500'; 
              break;
            case 'friction': 
              textColor = '#800080'; 
              break;
          }
          
          ctx.fillStyle = textColor;
          ctx.fillText(`  ${source}: ${magnitude}N (${direction})`, panelX + 15, panelY + yOffset);
          yOffset += 18;
        });
        yOffset += 5;
      }
    });
  }

  private loadAnimationData(): void {
    const windowWithData = window as Window & { ANIMATION_DATA?: AnimationData };
    const data: AnimationData | undefined = windowWithData.ANIMATION_DATA;

    if (!data) {
      console.warn("No animation data found on window object");
      return;
    }

    this.animationData = data;

    const forceMap: Map<string, ForceData[]> = this.buildForceMap(data.forces || [], data.objects || []);
    console.log("Force map:", forceMap);
  }

  private buildForceMap(forces: ForceData[], objects: ObjectData[]): Map<string, ForceData[]> {
    const forceMap: Map<string, ForceData[]> = new Map();

    if (!Array.isArray(objects) || !Array.isArray(forces)) {
      console.warn("Objects or forces data is not an array");
      return forceMap;
    }

    // Initialize force arrays for all known object IDs
    objects.forEach((obj: ObjectData) => {
      if (obj && obj.id) {
        forceMap.set(obj.id, []);
      }
    });

    // Add each force to the corresponding object's array
    forces.forEach((force: ForceData) => {
      if (force && force.applied_to) {
        const key: string = force.applied_to;
        if (forceMap.has(key)) {
          const forceArray: ForceData[] | undefined = forceMap.get(key);
          if (forceArray) {
            forceArray.push(force);
          }
        } else {
          forceMap.set(key, [force]); // in case of unknown object
        }
      }
    });

    return forceMap;
  }

  private computeDynamicScale(data: AnimationData, canvasWidth: number, canvasHeight: number): number {
  let maxX = 0;
  let maxY = 0;
  
  const objects = data.objects ?? [];
  const environments = data.environments ?? [];

  objects.forEach(obj => {
    const x = obj.position?.x ?? 0;
    const y = obj.position?.y ?? 0;
    const width = obj.width ?? 0;
    const height = obj.height ?? 0;

    maxX = Math.max(maxX, Math.abs(x) + width / 2);
    maxY = Math.max(maxY, Math.abs(y) + height / 2);
  });

  environments.forEach( env => {
    const x = env.position?.x ?? 0;
    const y = env.potsition?.y ?? 0;
    const width = env.width ?? 0;
    const height = env.width ?? 0;

    maxX = Math.max(maxX, Math.abs(x) + width / 2);
    maxY = Math.max(maxY, Math.abs(y) + height / 2);
  });

  const margin = 100; //Buffer pixels
  const scaleX = (canvasWidth - margin) / (2*maxX);
  const scaleY = (canvasHeight - margin) / (2 * maxY);

  return Math.min(scaleX, scaleY);
}

  public startAnimation(): void {
    this.resetAnimation();
    const data: AnimationData | null = this.animationData;
    if (!data || !Array.isArray(data.objects)) return;

    const canvasWidth: number = this.canvas.clientWidth;
    const canvasHeight: number = this.canvas.clientHeight;
    const environments = this.animationData?.environments ?? [];
    this.scale = this.computeDynamicScale(data, canvasWidth, canvasHeight);
    console.log("Auto Scale:", this.scale);
    const scale = this.scale;


    const groundEnvironment = environments.find(env=> env.type === "ground");
    const groundThickness = groundEnvironment?.thickness * scale;

    console.log("The thickness is", groundThickness);
    // Setup the world first
    this.setupWorld();

    // Disable gravity for horizontal frictionless surface
    this.engine.world.gravity.y = 0;
    this.engine.world.gravity.x = 0;

    // Set much slower engine timing for realistic physics
    this.engine.timing.timeScale = this.timeScale;




    // Create bodies from object data with more realistic properties
    data.objects.forEach((obj: ObjectData) => {
      if (!obj) return;
      
      const x: number = (obj.position?.x ?? 0) * scale;
      const y: number = (obj.position?.y ?? 0) * scale;


      // Appropriately sized rectangular blocks
      const width = (obj.width ?? 50) * scale;
      const height = (obj.height ?? 40) * scale;

      const blockHeightWorld = height / scale;
      const groundThicknessWorld = groundThickness;

      const adjustedY = y+ groundThicknessWorld / 2 + blockHeightWorld / 2;

      const { x: xValue , y: yValue} = toCanvasCoords(x, adjustedY, canvasWidth, canvasHeight);
      const body: Matter.Body = Matter.Bodies.rectangle(
        xValue,
        yValue,
        width,
        height,
        {
          mass: obj.mass || 1,
          label: obj.id || 'unknown',
          frictionAir: 0.005, // Minimal air resistance
          friction: 0.0, // Very small friction
          restitution: 0, // Some bounce for realism
          render: {
            fillStyle: obj.id === "m1" ? "#FF6B6B" : "#4ECDC4",
            strokeStyle: "#333",
            lineWidth: 2,
          },
        }
      );

      // Store mass info for custom rendering
      (body as any).massLabel = `${obj.mass || 1}kg`;

      Matter.World.add(this.world, body);
      if (obj.id) {
        this.bodies.set(obj.id, body);
      }
    });

    // Create rope constraint between m1 and m2 if they exist
    const m1Body: Matter.Body | undefined = this.bodies.get("m1");
    const m2Body: Matter.Body | undefined = this.bodies.get("m2");

    if (m1Body && m2Body) {
      const rope: Matter.Constraint = Matter.Constraint.create({
        bodyA: m1Body,
        bodyB: m2Body,
        length: 80, // Realistic rope length
        stiffness: 0.9, // Slightly flexible rope
        damping: 0.05, // Small damping to prevent excessive oscillations
        render: {
          visible: true,
          strokeStyle: "#8B4513",
          lineWidth: 4,
          type: "line",
        },
      });

      Matter.World.add(this.world, rope);
      this.constraints.set("rope", rope);
    }

    // Apply continuous forces using beforeUpdate event
    const forceMap: Map<string, ForceData[]> = this.buildForceMap(data.forces || [], data.objects);

    // Remove any existing force handler
    if (this.forceUpdateHandler) {
      Matter.Events.off(this.engine, "beforeUpdate", this.forceUpdateHandler);
    }

    // Create new force handler with realistic force scaling
    this.forceUpdateHandler = () => {
      forceMap.forEach((forces: ForceData[], objectId: string) => {
        const body: Matter.Body | undefined = this.bodies.get(objectId);
        if (!body) return;

        forces.forEach((force: ForceData) => {
          if (force && force.type === "applied") {
            // Apply external force with realistic scaling
            const magnitude: number = force.magnitude ?? 0;
            const direction: string = force.direction;
            const scale: number = 0.00005; // More realistic scaling factor

            let fx: number = 0;
            let fy: number = 0;
            if (direction === "x") fx = magnitude * scale;
            if (direction === "-x") fx = -magnitude * scale;
            if (direction === "y") fy = magnitude * scale;
            if (direction === "-y") fy = -magnitude * scale;

            Matter.Body.applyForce(
              body,
              { x: body.position.x, y: body.position.y },
              { x: fx, y: fy }
            );
          }
        });
      });
    };

    Matter.Events.on(this.engine, "beforeUpdate", this.forceUpdateHandler);

    Matter.Runner.run(this.runner, this.engine);
  }

  public resetAnimation(): void {
    this.isPaused = false;
    this.timeScale = 0.1; // Reset to slow speed

    Matter.Runner.stop(this.runner);

    // Remove force update handler if it exists
    if (this.forceUpdateHandler) {
      Matter.Events.off(this.engine, "beforeUpdate", this.forceUpdateHandler);
      this.forceUpdateHandler = null;
    }

    Matter.World.clear(this.world, false);
    this.bodies.clear();
    this.constraints.clear();

    // Reset gravity and timing
    this.engine.world.gravity.y = 0.8;
    this.engine.timing.timeScale = this.timeScale;

    console.log("Animation reset");
  }

  public togglePause(): void {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      Matter.Runner.stop(this.runner);
    } else {
      Matter.Runner.run(this.runner, this.engine);
    }
  }

  public toggleSlowMotion(): void {
    this.timeScale = this.timeScale === 0.1 ? 0.05 : 0.1; // Toggle between slow and very slow
    this.engine.timing.timeScale = this.timeScale;
  }

  public setAnimationSpeed(speed: number): void {
    // Allow setting custom animation speed (0.01 to 1.0)
    this.timeScale = Math.max(0.01, Math.min(1.0, speed));
    this.engine.timing.timeScale = this.timeScale;
  }

  public resize(): void {
    this.render.canvas.width = this.canvas.clientWidth;
    this.render.canvas.height = this.canvas.clientHeight;
    this.render.options.width = this.canvas.clientWidth;
    this.render.options.height = this.canvas.clientHeight;
  }

  public cleanup(): void {
    Matter.Runner.stop(this.runner);
    Matter.Render.stop(this.render);

    // Remove force update handler if it exists
    if (this.forceUpdateHandler) {
      Matter.Events.off(this.engine, "beforeUpdate", this.forceUpdateHandler);
      this.forceUpdateHandler = null;
    }

    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);

    this.bodies.clear();
    this.constraints.clear();

    console.log("MatterManager cleaned up");
  }
}

export default MatterManager;