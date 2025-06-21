// --- Enums ---
enum Forces {
  AirResistance 
  AppliedForce
  BuoyantForce
  CentripetalForce
  CoriolisForce
  ElectricForce
  FrictionForce
  GravitationalForce
  LiftThrustForce
  MagneticForce
  NetForce
  SpringForce
  TensionForce
  Torque
  NormalForce
}

// enum Fields {
//   AccelerationField
//   ElectricField
//   FluidFlowField
//   FluidVelocityField
//   ForceField
//   GravitationalField
//   MagneticField
//   PotentialField
//   PressureField
//   TemperatureField
// }

enum Interactions {
  Buoyancy
  Collision
  DragForce
  ElectrostaticForce
  Friction
  Gravity
  MagneticForce
  NormalForce
  SpringForce
  Tension
}

// enum Materials {
//   Density
//   Elasticity
//   FractureToughnes
//    Hardness
//    Plasticity
//    StressStrain
//   ThermalProperties
//   Viscosity
// }

enum Motions {
  CombinedTransRotMotion
  DampedOscillation
  LinearMotion
  ProjectileMotion2D
  ProjectileMotion3D
  RelativeMotion
  ResistiveMotion
  RotationalMotion
  SimpleHarmonicMotion
  UniformCircularMotion
}

enum Objects {
  Object
}

enum Environments {
  Cliff
  Ground
  Incline
  Wall
}

// --- AnimationData schema ---
class AnimationData {
  forces Forces[]
  // fields Fields[]
  interactions Interactions[]
  // materials Materials[]
  motions Motions[]
  objects Objects[]
  environments Environments[]
}


//Extra to the prompt (not using currently):   
//materials: ["Density", "Elasticity", "FractureToughness", "Hardness", "Plasticity", "StressStrain", "ThermalProperties", "Viscosity"]
//  fields: ["AccelerationField", "ElectricField", "FluidFlowField", "FluidVelocityField", "ForceField", "GravitationalField", "MagneticField", "PotentialField", "PressureField", "TemperatureField"]

//Original Prompts Here that I have changed:

//  forces: ["AirResistance", "AppliedForce", "BuoyantForce", "CentripetalForce", "CoriolisForce", "ElectricForce", "FrictionForce", "GravitationalForce", "LiftThrustForce", "MagneticForce", "NetForce", "SpringForce", "TensionForce", "Torque"]


// --- Step 1: Extract animation types from problem ---
function Extract_animation_data(problem: string) -> AnimationData {
  client "DeepseekChatClient"
  prompt #"""
    You are a physics expert. Extract relevant animation categories and types from the following problem.

  ## Categories:

  forces: ["AirResistance", "AppliedForce", "BuoyantForce", "CentripetalForce", "FrictionForce", "GravitationalForce", "NetForce", "SpringForce", "TensionForce", "Torque", "NormalForce"]
  
  interactions: ["Buoyancy", "Collision", "Friction", "Tension"]
  
  
  motions: ["DampedOscillation", "LinearMotion", "ProjectileMotion2D", "ProjectileMotion3D", "RotationalMotion", "SimpleHarmonicMotion", "UniformCircularMotion"]
  
  objects: ["Object"]

  environments: ["Cliff", "Ground", "Incline", "Wall"]

  ## Instructions:
  - For each detected category (force, motion, etc.), return a complete stub matching the full schema structure of that type, including all required keys (even with placeholder/default values).
  - If the problem involves multiple instances of the same force type applied to different objects, return a separate complete object for each instance.
  - For example, if there are two gravitational forces on two different objects, return two separate "GravitationalForce" objects in the forces array.
  - Use empty strings or default numbers (e.g., `0`) for values.
  - Return a full JSON object with arrays for: "forces", "motions", "interactions", and "objects".
  - Do NOT leave any schema fields out — include all fields defined in your official JSON schemas.
  - Do NOT invent new types — only use exact names from the lists above.
  - Do NOT merge or combine multiple forces of the same type into one object.
  - This data will be used in a second step to fill in the values.
  - Always assume a NormalForce acts upward on any object unless the problem explicitly states it's in free fall.
  - Use environments to create the animation, if there is a Cliff, Ground, Incline or Wall in the animation, include it.
  - If an incline needs to lay on the ground make the ground environment under it, this goes for all environments if they need the ground environment under it place it.
  - Objects are not environments! Do not use any of the Environment names as an object these include: "Cliff", "Ground", "Incline", "Wall".


    ## Problem:
    {{problem}}

  """#
}

function Update_Animation_Data(data: string, problem: string) -> string {
  client "DeepseekChatClient"
  prompt #"""
You are a physics simulation expert.

Given structured animation data in JSON format, your task is to fill in realistic physics values based on the provided problem description.

## CRITICAL REQUIREMENTS:
1. Return the COMPLETE JSON structure exactly as provided
2. Fill in ALL empty or default values with realistic physics data
3. Format ALL values as direct key-value pairs: "fieldName": number
4. Keep the exact same JSON structure - do not add, remove, or modify keys
5. Use SI units for all measurements
6. Return ONLY the JSON - no explanations, no markdown, no extra text
7. Any ID value should correspond to the same ID value as the object **IF and ONLY IF the object desires that motion, force, field, interaction, or material**. Match ID's as necessary!
8. Always assume a NormalForce acts upward on any object unless the problem explicitly states it's in free fall.
9. **For multiple objects of the same type (e.g., multiple blocks), assign distinct starting positions in space to prevent overlap or stacking.** Positions should be spaced reasonably apart along the relevant axis (usually the direction of motion, typically the x-axis).
10. If physical dimensions of objects are not specified, assume a default size of about 0.5 meters width and place objects at least that far apart on the axis of motion.
11. Use y=0 as the table or ground level unless the problem states otherwise.
12. For horizontal motion problems, initialize objects’ y positions at zero (on the surface), and set x positions distinctively.
13. For inclined planes or vertical setups, position coordinates must respect geometry implied by the angle and physical constraints.
14. Update environments as needed to make the animation correctly stuctured, if more then one environment type is needed then use it.
15. If an incline needs to lay on the ground make the ground environment under it, this goes for all environments if they need the ground environment under it place it.
16. Objects are not environments! Do not use any of the Environment names as an object these include: "Cliff", "Ground", "Incline", "Wall".



## Value Format Example:
```json
{
  "initialPosition": {
    "x": 0,
    "y": 45
  },
  "mass": 2.5,
  "gravity": 9.8
}
```

## Physics Conventions:
- y-axis is vertical (positive up)
- x-axis is horizontal
- Standard gravity: 9.8 m/s²
- Include all objects, forces, and interactions mentioned in the problem
- For springs: include both as force AND object with position

## Input Data:
Problem: {{problem}}

JSON Structure: {{data}}

## Output:
Return the complete JSON with all values filled as direct numbers (e.g., "x": 45, "mass": 2.5).
"""#
}
