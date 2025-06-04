// baml_src/main.baml

// Define the enum for problem categories
enum ProblemCategory {
  OneDKinematics @alias("1D Kinematics")
  TwoDKinematics @alias("2D Kinematics") 
  ForcesAndNewtonLaws @alias("Forces and Newton's Laws")
  WorkEnergyPower @alias("Work, Energy, Power")
  MomentumAndCollisions @alias("Momentum and Collisions")
  RotationalMotion @alias("Rotational Motion")
  SimpleHarmonicMotion @alias("Simple Harmonic Motion")
  GravitationAndOrbits @alias("Gravitation and Orbits")
}

// Define the client
client<llm> DeepSeekClient {
  provider openai
  options {
    model "deepseek-chat"
    api_key env.DEEPSEEK_API_KEY
    base_url "https://api.deepseek.com"
  }
}

// Define the function
function DetectProblemCategory(problem: string) -> ProblemCategory {
  client DeepSeekClient
  prompt #"
    You are a physics problem classifier. Given a problem, classify it as one of the following categories:
    - 1D Kinematics
    - 2D Kinematics  
    - Forces and Newton's Laws
    - Work, Energy, Power
    - Momentum and Collisions
    - Rotational Motion
    - Simple Harmonic Motion
    - Gravitation and Orbits
    
    Only respond with the exact problem category.
    
    Problem: {{ problem }}
  "#
}