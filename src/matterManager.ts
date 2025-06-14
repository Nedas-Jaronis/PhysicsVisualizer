import Matter from "matter-js";
import * as fields from "./types/fieldInterface";
import * as forces from "./types/forceInterface";
import * as interactions from "./types/interactionInterface";
import * as materials from "./types/materialsInterface";
import * as motions from "./types/motionInterface";
import * as object from "./types/objectInterface";


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


class MatterManager {
  private canvas: HTMLCanvasElement;
  private engine: Matter.Engine;
  private world: Matter.World;
  private render: Matter.Render;
  private runner: Matter.Runner;
  private bodies: Map<string, Matter.Body> = new Map();
  private constraints: Map<string, Matter.Constraint> = new Map();

  private timeScale = 1.0;
  private isPaused = false;


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


    // Start rendering
    Matter.Render.run(this.render);
  }

  private loadAnimationData(): void {
    const windowWithData = window as Window & { ANIMATION_DATA?: any };
    const data = windowWithData.ANIMATION_DATA;
    

    if (!data) {
      console.warn("No animation data found on window object");
      return;
    }

  try{
    const motions = data.motions
  } catch {
    console.log("No motion data")
  }
  try{
    const forces = data.forces
  }catch{
    console.log("No forces")
  }
  try{
    const objects = data.objects
  } catch{
    console.log("No objects")
  }
  try{
    const interactions = data.interactions
  } catch{
    console.log("No interactions")
  }
  try{
    const fields = data.fields
  } catch{
    console.log("No fields")
  }
  try{
    const materials = data.materials
  } catch{
    console.log("No materials")
  }
  }

  public resetAnimation(): void {
    this.isPaused = false;
    this.timeScale = 1.0;

    Matter.Runner.stop(this.runner);

    Matter.World.clear(this.world, false);
    this.bodies.clear();
    this.constraints.clear();


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
    this.timeScale = this.timeScale === 1.0 ? 0.3 : 1.0;
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

    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);

    this.bodies.clear();
    this.constraints.clear();

    console.log("MatterManager cleaned up");
  }
}

export default MatterManager;