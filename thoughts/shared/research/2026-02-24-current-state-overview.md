---
date: 2026-02-24T16:32:00-05:00
researcher: Claude Code
git_commit: 3dbb4ebe24754663f0dfe51f908f0d8a9113496f
branch: main
repository: Nedas-Jaronis/PhysicsVisualizer
topic: "Current State of PhysicsVis Codebase"
tags: [research, codebase, full-overview, architecture, physics, 3d-visualization]
status: complete
last_updated: 2026-02-24
last_updated_by: Claude Code
---

# Research: Current State of PhysicsVis Codebase

**Date**: 2026-02-24T16:32:00-05:00
**Researcher**: Claude Code
**Git Commit**: 3dbb4eb
**Branch**: main
**Repository**: Nedas-Jaronis/PhysicsVisualizer

## Research Question

What is the current state of the PhysicsVis codebase — what does it do, how is it structured, and how do all the pieces connect?

## Summary

PhysicsVis is an AI-powered physics problem solver and 3D visualizer. A user types a natural-language physics problem, the backend sends it to an LLM (currently OpenAI GPT-4o via BAML) which extracts structured animation data and solves the problem step-by-step, then the frontend renders an interactive 3D simulation using Three.js + Rapier alongside the text solution. The project covers 20+ physics scenarios (projectile motion, pendulums, springs, pulleys, collisions, torque, banked curves, elevators, etc.) with 70+ tunable parameters.

---

## Detailed Findings

### 1. Project Architecture

```
PhysicsVis/
├── backend/              # Node.js + Express API server
│   ├── src/
│   │   ├── server.ts     # Express server, /api/solve endpoint
│   │   └── schemaLoader.ts  # Loads JSON schemas by category
│   ├── baml_src/         # AI prompt definitions (BAML language)
│   │   ├── clients.baml  # LLM provider config (OpenAI GPT-4o)
│   │   ├── AnimationDetection.baml  # Extract + update animation data
│   │   ├── ProblemDetection.baml    # Solve problem step-by-step
│   │   └── generators.baml          # TypeScript codegen config
│   ├── baml_client/      # Auto-generated TypeScript client
│   ├── schemas/          # 65 JSON schema files across 7 categories
│   └── .env              # OPENAI_KEY
├── frontend/             # React 19 + Vite SPA
│   └── src/
│       ├── main.tsx            # Entry point with PhysicsProvider
│       ├── App.tsx             # React Router (5 routes)
│       ├── HomePage.tsx        # Problem input page
│       ├── Second.tsx          # Solution display page
│       ├── Third.tsx           # 3D visualization orchestrator (~1686 lines)
│       ├── PhysicsContent.tsx  # React Context for global state
│       ├── Query.tsx           # Alternative query component (unused)
│       ├── FormulasPage.tsx    # PDF formula sheet links
│       ├── InteractivePage.tsx # Matter.js standalone demo
│       ├── physics3d/          # 3D physics components
│       │   ├── PhysicsScene.tsx    # Canvas + Rapier + lighting
│       │   ├── ControlPanel.tsx    # 70+ parameter sliders
│       │   ├── primitives.tsx      # 24 physics components (~3724 lines)
│       │   └── index.ts           # Exports
│       └── matterManager.ts   # Legacy 2D physics (Matter.js)
└── schemas/              # Symlink or shared with backend
```

### 2. User Flow

1. **HomePage** (`/`) — User types a physics problem (e.g., "A 5kg block slides down a 30-degree incline with friction coefficient 0.3")
2. **POST /api/solve** — Backend runs two LLM calls in parallel:
   - **Animation path**: Extract animation types → Load JSON schemas → Fill in realistic values
   - **Problem path**: Extract formulas, step-by-step solution, final answer
3. **Second** (`/second-page`) — Displays problem statement, formulas (monospace), step-by-step solution, and final answer
4. **Third** (`/third-page`) — Renders interactive 3D simulation with:
   - Scene type auto-detected from problem keywords + animation data
   - Physics parameters extracted from backend JSON
   - Problem text parsed with 40+ regex patterns for overrides
   - Camera auto-positioned per scene type
   - Real-time parameter adjustment via ControlPanel sliders
   - Play/Pause, Replay (with current params), Reset (to original params)

### 3. Backend: LLM Integration

**BAML Framework** orchestrates all LLM calls via 3 functions:

| Function | Client | Purpose |
|----------|--------|---------|
| `Extract_animation_data(problem)` | CustomSonnet (GPT-4o) | Identifies forces, motions, interactions, objects, environments from problem text |
| `Update_Animation_Data(schemas, problem)` | CustomSonnet (GPT-4o) | Fills JSON schemas with realistic physics values (SI units) |
| `Extract_ProblemData(problem)` | CustomSonnet (GPT-4o) | Returns problem restatement, formulas, step-by-step solution, final answer |

**LLM Clients** (in `clients.baml`):

| Client | Provider | Model | API Key |
|--------|----------|-------|---------|
| CustomSonnet | openai | gpt-4o | env.OPENAI_KEY |
| CustomHaiku | openai | gpt-4o-mini | env.OPENAI_KEY |
| CustomGPT4oMini | openai | gpt-4o-mini | env.OPENAI_KEY |
| CustomGPT4o | openai | gpt-4o | hardcoded "---" |
| DeepseekChatClient | openai-generic | deepseek-chat | hardcoded "---" |
| CustomFast | round-robin | [GPT4oMini, Haiku] | — |
| OpenaiFallback | fallback | [GPT4oMini, GPT4oMini] | — |

**Environment**: `.env` contains `OPENAI_KEY=sk-hJj9r0CvvH3DzID0VJAc9w`

### 4. Backend: JSON Schema System

65 schema files across 7 categories define every physics concept:

| Category | Count | Examples |
|----------|-------|---------|
| **Forces/** | 13 | GravitationalForce, FrictionForce, SpringForce, TensionForce, Torque, NormalForce, AppliedForce, AirResistance, BuoyantForce, CentripetalForce, ElectricForce, MagneticForce, NetForce |
| **Motions/** | 10 | LinearMotion, ProjectileMotion2D/3D, RotationalMotion, SimpleHarmonicMotion, UniformCircularMotion, DampedOscillation, RelativeMotion, ResistiveMotion, CombinedTransRotMotion |
| **Interactions/** | 10 | Collision, Friction, Gravity, Tension, SpringForce, Buoyancy, DragForce, ElectrostaticForce, MagneticForce, NormalForce |
| **Environments/** | 8 | Ground, Incline, Wall, Cliff, Pendulum, Table, PulleySystem, Constraint |
| **Objects/** | 1 | Object (base definition: id, type, mass, position, velocity, acceleration, orientation, render options) |
| **Fields/** | 10 | GravitationalField, ElectricField, MagneticField, ForceField, AccelerationField, PotentialField, PressureField, TemperatureField, FluidFlowField, FluidVelocityField |
| **Materials/** | 8 | Density, Elasticity, Plasticity, Hardness, FractureToughness, StressStrain, ThermalProperties, Viscosity |

**Note**: Fields and Materials categories are defined in schemas but currently commented out in the BAML AnimationData class.

### 5. Frontend: 3D Physics Components

24 physics simulation components in `primitives.tsx` (~3724 lines):

| Component | Scenario | Physics Model |
|-----------|----------|---------------|
| **PhysicsBox** | Basic rigid body | Rapier dynamic RigidBody |
| **PhysicsSphere** | Rolling/bouncing sphere | Rapier BallCollider |
| **Ground** | Static floor | Rapier fixed body |
| **Ramp** | Inclined plane | Rapier fixed, Z-rotated |
| **Wall** | Vertical barrier | Rapier fixed body |
| **Cliff** | Tall drop structure | Rapier fixed body |
| **Spring** | Anchor + spring joint | Rapier useSpringJoint |
| **Pendulum** | Simple pendulum | Rapier dynamic bob + string visual |
| **Projectile** | Free-fall/thrown object | Rapier dynamic + trajectory tracking |
| **ForceArrow** | Visual force vector | Three.js ArrowHelper (visual only) |
| **BankedCurve** | Circular banked track | 1024 fixed segments in circle |
| **Car** | Vehicle on banked curve | Kinematic circular path + animated wheels |
| **StraightRoad** | Linear track | Visual road markings + distance markers |
| **LinearCar** | Accelerating vehicle | Kinematic: x = v0t + 1/2at^2 |
| **MassSpringSystem** | SHM with damping | Kinematic: x(t) = Ae^(-ct/2m)cos(wt) |
| **CircularMotionString** | Mass on string | Kinematic: horizontal/vertical/conical |
| **HorizontalPush** | Applied force + friction | Kinematic: F vs static friction threshold |
| **Elevator** | Apparent weight | Kinematic: W_app = m(g+a) |
| **TwoRopeTension** | Two-rope system | Static: T = W/(2cos(theta)) |
| **AtwoodMachine** | Pulley system | Kinematic: a = (m2-m1)g/(m1+m2) |
| **TablePulley** | Table edge pulley | Kinematic with friction |
| **TorqueDemo** | Door/rod rotation | Kinematic: I=(1/3)ML^2, tau=rFcos(a) |
| **Seesaw** | Lever balance | Kinematic with torque imbalance |
| **EnhancedCollision** | Momentum conservation | Kinematic: elastic/inelastic formulas |
| **EnergyBars** | Energy visualization | Visual bars for KE/PE/Spring/Dissipated |
| **PoweredLift** | Constant power lift | Kinematic: v = P/(mg) |

### 6. Frontend: Scene Selection Logic

`Third.tsx` determines which 3D scene to render via `determineSceneType()`:

- Analyzes problem text for keywords (cliff, pulley, incline, pendulum, spring, etc.)
- Checks animation_data structure for specific types
- Returns one of 20+ scene type strings
- `problemAnalysis` useMemo parses problem text with 40+ regex patterns for numerical overrides (applied force, friction coefficient, heights, angles, speeds, spring constants, masses, collision types, power, etc.)

### 7. Frontend: State Management

React Context (`PhysicsContent.tsx`) stores:
- `solution` — final answer text
- `formulas` — physics formulas used
- `stepByStep` — solution walkthrough
- `problem` — original problem statement
- `animation_data` — structured JSON for 3D scene configuration

All set by HomePage after backend response, consumed by Second and Third pages.

### 8. Frontend: Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | HomePage | Problem input with spiral animation background |
| `/second-page` | Second | Text solution display |
| `/third-page` | Third | 3D interactive visualization |
| `/formula-page` | FormulasPage | PDF formula sheet links (PHY 2048-4324) |
| `/Interactive-page` | InteractivePage | Standalone Matter.js demo |

### 9. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 + Vite 6.3 |
| Routing | React Router v7 |
| 3D Graphics | Three.js 0.178 + @react-three/fiber 9.5 |
| 3D Physics | Rapier via @react-three/rapier 2.2 |
| 2D Physics (legacy) | Matter.js 0.20 |
| Animation | GSAP 3.14 |
| UI Controls | Leva 0.10 |
| Backend Runtime | Node.js + Express 4.21 |
| AI Orchestration | BAML 0.202 |
| LLM Provider | OpenAI (GPT-4o, GPT-4o-mini) |
| Language | TypeScript 5.7 throughout |
| Module System | ES Modules |

### 10. Current Working State

**Modified files** (uncommitted):
- `backend/baml_client/inlinedbaml.ts` — regenerated after client switch
- `backend/baml_src/clients.baml` — switched from Anthropic to OpenAI

**Recent commits**: Short messages (".", "spring"), indicating rapid iteration.

**Server**: Runs on port 5000 (0.0.0.0), frontend on Vite dev server.

---

## Code References

- `backend/src/server.ts` — Express server, /api/solve endpoint, parallel LLM calls
- `backend/src/schemaLoader.ts` — Dynamic JSON schema loading by category
- `backend/baml_src/clients.baml` — LLM client configuration (GPT-4o via OPENAI_KEY)
- `backend/baml_src/AnimationDetection.baml` — Animation extraction + value population prompts
- `backend/baml_src/ProblemDetection.baml` — Problem solving prompt
- `frontend/src/HomePage.tsx` — Problem input UI with spiral background
- `frontend/src/Second.tsx` — Solution display with formulas/steps/answer
- `frontend/src/Third.tsx` — Scene type detection, parameter extraction, 3D orchestration
- `frontend/src/PhysicsContent.tsx` — React Context provider for physics state
- `frontend/src/physics3d/primitives.tsx` — All 24 physics simulation components
- `frontend/src/physics3d/PhysicsScene.tsx` — Three.js Canvas + Rapier + lighting
- `frontend/src/physics3d/ControlPanel.tsx` — 70+ parameter sliders with play/pause/replay/reset
- `frontend/src/matterManager.ts` — Legacy 2D physics system (Matter.js)

## Architecture Documentation

**Data Flow Pipeline:**
```
User types problem → POST /api/solve
  ├─ [Parallel] Extract_animation_data → loadAllSchemas → Update_Animation_Data → animation_data JSON
  └─ [Parallel] Extract_ProblemData → { problem, formulas, stepByStep, solution }
→ Response to frontend
→ Context stores all data
→ Second page displays text solution
→ Third page renders 3D scene:
    determineSceneType() + extractPhysicsParams() + problemAnalysis regex
    → Select physics component → PhysicsScene renders with Rapier
    → ControlPanel for live adjustment → onUpdate callbacks for live data
```

**Key Patterns:**
1. **Schema-driven AI**: LLM identifies physics types from enums, schemas loaded from disk, LLM populates values
2. **Parallel processing**: Animation and problem solving run simultaneously via Promise.all()
3. **Dual detection**: Scene type detected from both problem text keywords AND animation data structure
4. **Kinematic vs Dynamic**: Some components use Rapier physics engine, others use pure kinematic math
5. **SI units throughout**: All backend values in standard SI units (m, kg, N, s)

## Open Questions

- Fields/ and Materials/ schema categories exist but are commented out in BAML enums — are they planned for future use?
- Query.tsx exists but is not routed — is it a legacy or planned alternative?
- matterManager.ts (2D physics) — is this still actively used or fully superseded by physics3d?
- Pendulum constraint implementation is marked as TODO in primitives.tsx
