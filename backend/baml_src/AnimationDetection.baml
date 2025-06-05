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

enum Fields {
  AccelerationField
  ElectricField
  FluidFlowField
  FluidVelocityField
  ForceField
  GravitationalField
  MagneticField
  PotentialField
  PressureField
  TemperatureField
}

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

enum Materials {
  Density
  Elasticity
  FractureToughnes
   Hardness
   Plasticity
   StressStrain
  ThermalProperties
  Viscosity
}

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
  fields Fields[]
  interactions Interactions[]
  materials Materials[]
  motions Motions[]
  objects Objects[]
}




// --- Step 1: Extract animation types from problem ---
function Extract_animation_data(problem: string) -> AnimationData {
  client "DeepseekR1Client"
  prompt #"""
    You are a physics expert. Extract relevant animation categories and types from the following problem.

  ## Categories:

  forces: ["AirResistance", "AppliedForce", "BuoyantForce", "CentripetalForce", "CoriolisForce", "ElectricForce", "FrictionForce", "GravitationalForce", "LiftThrustForce", "MagneticForce", "NetForce", "SpringForce", "TensionForce", "Torque"]

  fields: ["AccelerationField", "ElectricField", "FluidFlowField", "FluidVelocityField", "ForceField", "GravitationalField", "MagneticField", "PotentialField", "PressureField", "TemperatureField"]
  
  interactions: ["Buoyancy", "Collision", "DragForce", "ElectrostaticForce", "Friction", "Gravity", "MagneticForce", "NormalForce", "SpringForce", "Tension"]
  
  materials: ["Density", "Elasticity", "FractureToughness", "Hardness", "Plasticity", "StressStrain", "ThermalProperties", "Viscosity"]
  
  motions: ["CombinedTransRotMotion", "DampedOscillation", "LinearMotion", "ProjectileMotion2D", "ProjectileMotion3D", "RelativeMotion", "ResistiveMotion", "RotationalMotion", "SimpleHarmonicMotion", "UniformCircularMotion"]
  
  objects: ["Object"]


    ## Problem:
    {{problem}}

    ## Instructions:
    - ONLY use exact type names from the enums.
    - Do NOT include types that are not relevant.
    - Format your response as a JSON object of type AnimationData.
  """#
}

function Update_Animation_Data(data: string) -> string{
  client "DeepseekR1Client"
  prompt #"""
You are a physics simulation expert.

Given structured animation data with physics categories such as forces, fields, interactions, motions, and objects, your task is to **fill in or update the fields in this JSON** with realistic default values or enhancements.

## Instructions:
- Keep the structure of the input JSON the same.
- For every motion or object with a JSON schema, update it to include example or default values **that satisfy the schema**.
- Use realistic physics defaults (e.g., `g = 9.8`, projectile launched at `vx = 50 * cos(θ)`, etc.).
- Never remove keys from the original JSON.
- All values should be in SI units.
- Return only the final **updated JSON object** as output.
- Do not explain anything — just return a valid JSON object.

## Input:
{{data}}

## Output:
Updated JSON with motion and object fields populated according to schema.
"""#

} 