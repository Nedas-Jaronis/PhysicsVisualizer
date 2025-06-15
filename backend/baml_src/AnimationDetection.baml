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

// --- AnimationData schema ---
class AnimationData {
  forces Forces[]
  // fields Fields[]
  interactions Interactions[]
  // materials Materials[]
  motions Motions[]
  objects Objects[]
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


    ## Problem:
    {{problem}}

    ## Instructions:
    - ONLY use exact type names from the enums.
    - Do NOT include types that are not relevant.
    - Format your response as a JSON object of type AnimationData.
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