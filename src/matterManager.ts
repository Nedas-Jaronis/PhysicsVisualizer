import Matter from "matter-js";
import { Bodies, Body, Vector } from 'matter-js'
import { env } from "process";
// import * as fieldsInterface from "./types/fieldInterface";
// import * as forcesInterface from "./types/forceInterface";
// import * as interactionsInterface from "./types/interactionInterface";
// import * as materialsInterface from "./types/materialsInterface";
// import * as motionsInterface from "./types/motionInterface";
import { Object as PhysicsObject } from "./types/objectInterface";
import { getEnvironmentData } from "worker_threads";
import { createTypeReferenceDirectiveResolutionCache } from "typescript";
import { Console, error } from "console";
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
    const CenterHeight = canvasHeight * .7;
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
  private groundHeight: number = 20;
  private cliffTopX?: number;
  private cliffTopY?: number;
  private angleRadians?: number;
  private InclineX?: number;
  private InclineY?: number;
  private InclineLength?: number;
  private InclineWidth?: number;
  private InclineLeg?: string;
  private cliffWidth?: number;


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
    const groundBodies: Matter.Body[] = [];
    const data = this.animationData
    const scale = this.scale;
    const heightGround = this.groundHeight;


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
            const groundHeight_ = heightGround;
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

            groundBodies.push(ground);
            console.log("This is the middle", x, "the y: ", y)
            break;

          case "incline":
            const groundIncline = data.environments?.find(env => env.type === "ground");
            const legSide = environment.leg.type ?? "left";

            let angleDegrees: number;
            angleDegrees = environment.angle ?? 30;
            
            if(legSide === "left"){
              angleDegrees = angleDegrees;
            } else if (legSide === "right"){
              angleDegrees = 180 - angleDegrees;
            }
            const angleRadians = angleDegrees * (Math.PI / 180);
            
            const inclineX = (environment.position?.x ?? 0) * scale;
            const inclineY = (environment.position?.y ?? 0) * scale;
            const { x: InclineX, y: InclineY } = toCanvasCoords(inclineX, inclineY, canvasWidth, canvasHeight);

            const length = (environment.length ?? 5) * scale;
            const width = (environment.thickness ?? 0.2) * scale;

            // const frictionKinetic = environment.friction?.kinetic ?? 0;
            // const frictionStatic = environment.friction?.static ?? 0;

            // Calculate ground top Y:
            let groundTopY = null;
            if (groundIncline) {
              const groundY = (groundIncline.position?.y ?? 0) * scale;
              const groundHeight = heightGround;
              const { y: groundCanvasY } = toCanvasCoords(0, groundY, canvasWidth, canvasHeight);
              groundTopY = groundCanvasY - groundHeight / 2;
            }

            // Calculate bottom of incline:
            const bottomOffsetY = (length / 2) * Math.sin(angleRadians) - 7;
            const bottomY = InclineY + bottomOffsetY;

            // Calculate vertical shift needed:
            let verticalShift = 0;
            if (groundTopY !== null) {
              verticalShift = groundTopY - bottomY +(width/1.9);
            }

            // Shift incline Y by verticalShift:
            const shiftedInclineY = InclineY + verticalShift;

            const incline = Matter.Bodies.rectangle(
              InclineX,
              shiftedInclineY,
              length,
              width,
              {
                isStatic: true,
                angle: angleRadians,
                friction: 0,
                frictionStatic: 0,
                render: {
                  fillStyle: '#999999',
                  strokeStyle: '#666666',
                  lineWidth: 2
                }
              }
            );

            environmentBodies.push(incline);

            if (environment.leg) {
              const legThickness = (environment.leg.thickness ?? 10) * scale;


              const legHeight = Math.sin(angleRadians) * length;
              const legWidth = legThickness;

              let legX = InclineX - (legWidth / 5);
              if (legSide === "left") legX -= ((length / 1.96) * Math.cos(angleRadians));
              else if (legSide === "right") legX -= (length / 1.9) * Math.cos(angleRadians);

              const correctedInclineY = shiftedInclineY  - (legWidth/2);

              const leg = Matter.Bodies.rectangle(
                legX,
                correctedInclineY,
                legWidth,
                legHeight,
                {
                  isStatic: true,
                  angle: 0,
                  render: {
                    fillStyle: '#999999',
                    strokeStyle: '#666666',
                    lineWidth: 2,
                  }
                }
              );

              environmentBodies.push(leg);
            }

            this.angleRadians = angleRadians;
            this.InclineX = (environment.position?.x ?? 0) * scale;
            this.InclineY = (environment.position?.y ?? 0) * scale;
            this.InclineLength = (environment.length ?? 200) * scale;
            this.InclineWidth = (environment.width ?? 30) * scale;
            this.InclineLeg = (environment.leg.type ?? "left");


            break;

          case "cliff":

            const cliffWidth = (environment.width ?? 150) * scale;
            const cliffHeight = (environment.height ?? 150) * scale;

            let cliffY: number;
            
            const groundCliff = data.environments?.find(env => env.type === "ground");
            if(groundCliff){
              const groundH = heightGround;
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

            this.cliffTopX = cliffX - (cliffWidth);
            this.cliffTopY = cliffY + (cliffHeight / 2);
            this.cliffWidth = cliffWidth;

            break;

          case "wall":
          
          
          
          const wallWidth = (environment.width ?? 50) * scale;
          const wallHeight = (environment.height ?? 200) * scale;          
          let wallY: number;
          //Wall Properties
          const ground_ = data.environments?.find(env => env.type === "ground");
          if(ground_){
            const groundHeight = heightGround;
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

  if(environmentBodies.length > 0 || groundBodies.length >0){
    Matter.World.add(this.world, [...environmentBodies, ...groundBodies, rightWall, leftWall]);
  }


  // Matter.World.add(this.world, [leftWall, rightWall]);
  }

public setupObjects(): void {
  const data = this.animationData;
  if (!data || !Array.isArray(data.objects)) return;

  const scale = this.scale;
  const canvasWidth = this.canvas.clientWidth;
  const canvasHeight = this.canvas.clientHeight;
  const groundHeight = this.groundHeight;

  // Define a minimum visual size in pixels to prevent tiny objects
  const minVisualSizePx = 20;

  data.objects.forEach((obj: ObjectData) => {
    // Step 1: Calculate initial position in world coordinates
    let x = (obj.position?.x ?? 0) * scale;
    let y = ((obj.position?.y ?? 0) * scale) + (groundHeight / 2);

    // Step 2: Calculate object dimensions
    let width = (obj.width ?? 0.5) * scale;
    let height = (obj.height ?? 0.5) * scale;

    // Enforce minimum visible size
    width = Math.max(width, minVisualSizePx);
    height = Math.max(height, minVisualSizePx);

    // Step 3: Handle special positioning (cliff, incline, etc.)
    let bodyAngle = 0; // Default angle

    const cliffW = this.cliffWidth ?? 1;
    const objWidth = obj.width ?? 1;
    const maxOffSet = Math.max(objWidth, cliffW); 
    // Handle cliff positioning
    if (obj.onCliff && this.cliffTopX !== undefined && this.cliffTopY !== undefined) {
      x = this.cliffTopX - maxOffSet;
      y = this.cliffTopY + height / 2;
    }
    
    // Handle incline positioning
  else if (obj.onIncline) {
    if (
      typeof this.InclineLength !== "number" ||
      typeof this.angleRadians !== "number" ||
      typeof this.InclineX !== "number" ||
      typeof this.InclineY !== "number" ||
      typeof this.InclineWidth !== "number"
    ) {
      console.warn("Incline parameters not set properly, skipping incline positioning");
    } else if (typeof obj.inclinePositionRatio === "number") {
      const ratio = obj.inclinePositionRatio;

      const inclineHalfLength = this.InclineLength / 2;
      const inclineCenterX = this.InclineX;
      const inclineCenterY = this.InclineY;

      console.log("Incline Length", this.InclineLength, "This is the half: ", inclineHalfLength)

      console.log(inclineCenterX, "...",inclineCenterY);
      const calculation = inclineHalfLength * Math.cos(this.angleRadians);
      console.log("calculation: ", calculation, "Radians", this.angleRadians);

      const leftX = inclineCenterX - ((this.InclineLength * Math.cos(this.angleRadians))/2);
      const leftY = inclineCenterY - ((this.InclineLength * Math.sin(this.angleRadians))/2);
      const rightX = inclineCenterX + ((this.InclineLength * Math.cos(this.angleRadians))/2);
      const rightY = inclineCenterY + ((this.InclineLength * Math.sin(this.angleRadians))/2);
      // Determine top and bottom ends
      let topX, topY, bottomX, bottomY;
  if (leftY < rightY) {
    topX = leftX;
    topY = leftY;
    bottomX = rightX;
    bottomY = rightY;
  } else {
    topX = rightX;
    topY = rightY;
    bottomX = leftX;
    bottomY = leftY;
  }
    console.log("LeftY = ", leftY, "leftX = ", leftX);
    console.log("RightX = ", rightX, "RightY = ", rightY);

      console.log("TX=",topX, "TY=", topY, "BY=",bottomY, "BX=",bottomX)

      // Object world position along the incline
      x = bottomX + ratio * (topX - bottomX);
      y =  ratio * (bottomY - topY);
      console.log(x,"...",y)

      // Width and height (scaled once)
      const width = (obj.width ?? 50) * scale;
      const height = (obj.height ?? 50) * scale;

      // Offset upward perpendicular to incline by half width
      const perpOffsetX = (width / 2) * Math.sin(this.angleRadians);
      const perpOffsetY = (width / 2) * Math.cos(this.angleRadians);

      // Offset upward again by object's height (to rest it *on* the surface)
      const objOffsetX = (height / 2) * Math.sin(this.angleRadians);
      const objOffsetY = (height / 2) * Math.cos(this.angleRadians);

      // Apply total offset
      if(this.InclineLeg == "left"){
        x += perpOffsetX + objOffsetX;
        y += perpOffsetY + objOffsetY;
      } else if (this.InclineLeg == "right"){
        x -= perpOffsetX + objOffsetX;
        y -= perpOffsetY + objOffsetY;
      }


      // Convert final position to canvas
      const { x: canvasX, y: canvasY } = toCanvasCoords(x, y, canvasWidth, canvasHeight);
      console.log("Canvas X: ", canvasX, "CanvasY", canvasY)

      const body = Matter.Bodies.rectangle(
        canvasX,
        canvasY,
        width,
        height,
        {
          mass: obj.mass ?? 1,
          isStatic: false,
          friction: 0,
          restitution: 0,
          frictionAir: 0.002,
          render: {
            fillStyle: "#4ECDC4",
            strokeStyle: "#333",
            lineWidth: 2,
          },
        }
      );

      Matter.Body.setAngle(body, this.angleRadians);
      Matter.World.add(this.world, body);
      if (obj.id) this.bodies.set(obj.id, body);
      return; // Skip default handling
    }
  }


    // Step 4: Convert to canvas coordinates (for non-incline objects)
    const { x: xCanvas, y: yCanvas } = toCanvasCoords(x, y, canvasWidth, canvasHeight);
    
    
    // Step 5: Create the physics body
    const body = Matter.Bodies.rectangle(
      xCanvas,
      yCanvas,
      width,
      height,
      {
        mass: obj.mass ?? 1,
        isStatic: false,
        friction: 0,
        restitution: 0,
        frictionAir: 0.002,
        render: {
          fillStyle: "#4ECDC4",
          strokeStyle: "#333",
          lineWidth: 2,
        },
      }
    );

    // Step 6: Apply rotation if needed
    if (bodyAngle !== 0) {
      Matter.Body.setAngle(body, bodyAngle);
    }

    // Step 7: Add to world and track
    Matter.World.add(this.world, body);

    // Track by ID for later access
    if (obj.id) this.bodies.set(obj.id, body);
  });
}
//Later access with this Matter.Body.setStatic(m1Body, false); to make it move
// apply forces like, Matter.Body.applyForce(m1Body, m1Body.position, { x: 0.05, y: 0 });



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

  // Determine minimum scale based on environment types
  const hasWideBaseEnv = environments.some(env =>
    env.type === "ground" || env.type === "incline"
  );
  const MIN_SCALE = hasWideBaseEnv ? 0 : 64;
  const MAX_SCALE = 100;

  // Objects
  objects.forEach(obj => {
    const x = obj.position?.x ?? 0;
    const y = obj.position?.y ?? 0;
    const width = obj.width ?? 0;
    const height = obj.height ?? 0;

    maxX = Math.max(maxX, Math.abs(x) + width / 2);
    maxY = Math.max(maxY, Math.abs(y) + height / 2);
  });

  // Environments
  environments.forEach(env => {
    const x = env.position?.x ?? 0;
    const y = env.position?.y ?? 0;
    const width = env.width ?? env.thickness ?? 0;
    const height = env.height ?? 0;

    maxX = Math.max(maxX, Math.abs(x) + width / 2);
    maxY = Math.max(maxY, Math.abs(y) + height / 2);
  });

  const margin = 100;
  const minSceneWidth = 5;
  const minSceneHeight = 5;

  const safeX = Math.max(maxX, minSceneWidth);
  const safeY = Math.max(maxY, minSceneHeight);

  const scaleX = (canvasWidth - margin) / (2 * safeX);
  const scaleY = (canvasHeight - margin) / (2 * safeY);

  const scale = Math.max(Math.min(scaleX, scaleY, MAX_SCALE), MIN_SCALE);

  console.log("maxX:", maxX, "maxY:", maxY, "→ scale:", scale, "MIN_SCALE used:", MIN_SCALE);
  return scale;
}

private ChooseBody(
  x: number,
  y: number,
  shape: 'circle' | 'polygon' | 'rectangle' | 'trapezoid' | 'fromvertices',
  radius?: number,
  sides?: number,
  width?: number,
  height?: number,
  slope?: number,
  vertexSet?: Vector[]
): Body | null {
  let body: Body | null = null;

  switch (shape.toLowerCase()) {
    case 'circle':
      if (radius) {
        body = Bodies.circle(x, y, radius);
      }
      break;

    case 'polygon':
      if (sides && radius) {
        body = Bodies.polygon(x, y, sides, radius);
      }
      break;

    case 'rectangle':
      if (width && height) {
        body = Bodies.rectangle(x, y, width, height);
      }
      break;

    case 'trapezoid':
      if (width && height && slope !== undefined) {
        body = Bodies.trapezoid(x, y, width, height, slope);
      }
      break;

    case 'fromvertices':
      if (vertexSet && vertexSet.length > 0) {
        body = Bodies.fromVertices(x, y, [vertexSet], { isStatic: false }) as Body;
      }
      break;

    default:
      console.warn('Unknown body type:', shape);
      break;
  }

  return body;
}



  public startAnimation(): void {
    
    
    // Disable gravity for horizontal frictionless surface
    this.engine.world.gravity.y = 0;
    this.engine.world.gravity.x = 0;
    
    // Set much slower engine timing for realistic physics
    this.engine.timing.timeScale = this.timeScale;
    
    const data: AnimationData | null = this.animationData;
    if (!data || !Array.isArray(data.objects)) return;
    
    const canvasWidth: number = this.canvas.clientWidth;
    const canvasHeight: number = this.canvas.clientHeight;
    const environments = this.animationData?.environments ?? [];
    this.scale = this.computeDynamicScale(data, canvasWidth, canvasHeight);
    console.log("Auto Scale:", this.scale);
    const scale = this.scale;
    
    this.resetAnimation();
    this.setupWorld();
    this.setupObjects();

    const groundEnvironment = environments.find(env=> env.type === "ground");
    const groundThickness = (groundEnvironment?.thickness ?? 20) * scale;

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