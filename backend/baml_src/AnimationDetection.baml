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

function Update_Animation_Data(data: string, problem: string) -> string{
  client "DeepseekChatClient"
  prompt #"""
You are a physics simulation expert.

Given structured animation data in JSON format with categories such as forces, fields, interactions, motions, and objects, your task is to **replace empty or default values** with realistic physics values that match the meaning of each field. Fill in all fields by using the problem given to piece together all key values.

## Instructions:
- DO NOT add or remove any keys.
- DO NOT change the structure of the JSON.
- ONLY fill in or replace values for existing keys.
- Use realistic defaults where necessary (e.g., `g = 9.8`, objects falling from height, etc.).
- Assume standard physics conventions: `y` is vertical, `x` is horizontal.
- All units must be in SI units.
- Return only the updated JSON object — no extra explanation or formatting.

## Examples:
- If `"initialPosition.y": 0` but the problem implies a 45-meter cliff, set `"initialPosition.y": 45`.
- Leave all other fields untouched unless their value needs to be set.

## Input:
{{problem}}
{{data}}

## Output:
Updated JSON with only the values filled or replaced according to the problem, just return json data, with the updated key values. Keep the exact same format!!!
"""#



} 