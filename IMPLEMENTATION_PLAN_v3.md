# Physics Visualization - Implementation Plan v3

## Overview

Implement physics simulations to support all problem types in `physics.md`. This plan creates visual, interactive 3D simulations for Physics 1 concepts with proper error handling and comprehensive coverage.

**Date Created:** 2026-01-23
**Total Phases:** 10
**Estimated New Components:** 15
**Estimated New Scene Types:** 12

---

## Current State Analysis

### Already Implemented
| Component | Purpose | Scene Types |
|-----------|---------|-------------|
| `PhysicsBox`, `PhysicsSphere` | Basic rigid bodies | all |
| `Ground`, `Ramp`, `Wall`, `Cliff` | Environment elements | incline, projectile |
| `Pendulum` | Simple harmonic motion | pendulum |
| `Spring` | Spring visualization (basic) | spring |
| `Projectile` | Trajectory tracking | projectile |
| `BankedCurve`, `Car` | Circular banked track | banked_curve |
| `StraightRoad`, `LinearCar` | Linear kinematics | linear_kinematics |
| `ForceArrow` | Force visualization | visual helper |

### Scene Types Currently Detected
`pendulum`, `spring`, `banked_curve`, `circular`, `pulley`, `incline`, `collision`, `projectile`, `freefall`, `rotation`

---

## Desired End State

After all phases complete:
1. **18 scene types** fully implemented and rendered
2. **All 44 problems** from physics.md can be visualized
3. **Graceful fallback** for unparseable problems
4. **Unit conversion** for non-SI inputs
5. **Compound problem** support (e.g., incline + spring + pulley)

---

## What We're NOT Doing

- Wave/sound visualization (requires different rendering approach)
- Electric/magnetic fields (Physics 2 content)
- Fluid dynamics (buoyancy, drag)
- Rocket propulsion with variable mass
- Variable velocity functions like v(t) = 4t - 2 (requires calculus integration)
- Conceptual-only questions (e.g., "Why are airbags effective?")

---

## Phase Dependencies

```
Phase 1 (Foundation) ──┬──> Phase 2 (Newton's Laws)
                       │
                       ├──> Phase 3 (Pulley Systems)
                       │
                       └──> Phase 4 (Collisions)
                              │
Phase 5 (Rotational) ─────────┘
                              │
Phase 6 (Energy) ─────────────┘
                              │
Phase 7 (Parsing) ◄───────────┴──── All component phases
                              │
Phase 8 (Control Panel) ◄─────┘
                              │
Phase 9 (Error Handling) ◄────┘
                              │
Phase 10 (Compound Scenes) ◄──┘
```

---

## Phase 1: Foundation - Spring & Circular Motion Enhancements

### Overview
Enhance two fundamental physics demonstrations: mass-spring oscillation and circular motion on a string.

### 1.1 MassSpringSystem Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface MassSpringSystemProps {
  mass: number                    // kg
  springConstant: number          // N/m (k)
  dampingCoefficient: number      // damping factor
  amplitude: number               // m (initial displacement)
  orientation: 'horizontal' | 'vertical'
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: (data: {
    position: THREE.Vector3
    velocity: THREE.Vector3
    time: number
    period: number
    frequency: number
  }) => void
}
```

**Physics:**
- SHM: x(t) = A·cos(ωt), where ω = √(k/m)
- Period: T = 2π√(m/k)
- Vertical equilibrium shift: x_eq = mg/k

**Visual Elements:**
- Fixed anchor (wall for horizontal, ceiling for vertical)
- Coil spring geometry (15-20 coils)
- Mass block attached to spring end
- Equilibrium position marker (dashed line)
- Optional: velocity and acceleration arrows

**Camera Settings:**
```typescript
position: [5, 2, 8]
target: [0, 0, 0]
```

### 1.2 CircularMotionString Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface CircularMotionStringProps {
  mass: number                    // kg
  radius: number                  // m
  speed: number                   // m/s (tangential)
  plane: 'horizontal' | 'vertical' | 'conical'
  stringLength?: number           // m (for conical pendulum)
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: (data: {
    position: THREE.Vector3
    velocity: THREE.Vector3
    time: number
    centripetalAcceleration: number
    tension: number
  }) => void
}
```

**Physics:**
- Centripetal acceleration: a_c = v²/r
- Tension (horizontal): T = mv²/r
- Tension (vertical, at angle θ): T = mv²/r + mg·cos(θ)
- Conical pendulum period: T = 2π√(L·cos(θ)/g)

**Visual Elements:**
- Central pivot point
- String/rope connecting pivot to mass
- Mass (sphere)
- Tension vector arrow
- Centripetal force arrow (toward center)
- For vertical: critical speed indicator

**Camera Settings:**
```typescript
// Horizontal plane
position: [0, 8, 8]
target: [0, 0, 0]

// Vertical plane
position: [8, 2, 0]
target: [0, 2, 0]
```

### 1.3 Update Exports

**File:** `frontend/src/physics3d/index.ts`
- [ ] Export `MassSpringSystem`
- [ ] Export `CircularMotionString`

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `cd frontend && npm run build`
- [ ] No console errors when loading spring scene
- [ ] No console errors when loading circular scene

#### Manual Verification:
- [ ] Problem "mass-spring system with k=500 N/m and m=2kg" → correct period displayed
- [ ] Problem "3kg mass whirled in circle of radius 0.8m at 6 m/s" → correct tension displayed
- [ ] Vertical spring shows equilibrium shift
- [ ] Horizontal circular motion shows rotating mass with string
- [ ] Pause/replay/reset work correctly
- [ ] Time display pauses when simulation paused

**Implementation Note:** After completing automated verification, pause for manual confirmation before proceeding to Phase 2.

---

## Phase 2: Newton's Laws Visualizations

### Overview
Implement three classic Newton's Laws demonstrations: horizontal push with friction, elevator apparent weight, and two-rope tension.

### 2.1 HorizontalPush Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface HorizontalPushProps {
  mass: number                      // kg
  appliedForce: number              // N
  staticFrictionCoeff: number       // μs
  kineticFrictionCoeff: number      // μk
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: (data: {
    position: THREE.Vector3
    velocity: THREE.Vector3
    acceleration: THREE.Vector3
    time: number
    frictionState: 'static' | 'kinetic'
    netForce: number
  }) => void
}
```

**Physics:**
- Static: If F_applied ≤ μs·N, object stationary, f = F_applied
- Kinetic: If F_applied > μs·N, object moves, f = μk·N
- Acceleration: a = (F_applied - μk·mg) / m

**Visual Elements:**
- Flat ground surface with texture
- Box that can slide
- Force arrows: Applied (blue), Friction (red), Normal (green), Weight (orange)
- State indicator label ("STATIC" or "KINETIC")

**Camera Settings:**
```typescript
position: [8, 4, 8]
target: [0, 0.5, 0]
```

### 2.2 Elevator Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface ElevatorProps {
  personMass: number                // kg
  elevatorAcceleration: number      // m/s² (+ up, - down)
  maxHeight: number                 // m
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: (data: {
    position: THREE.Vector3
    velocity: THREE.Vector3
    time: number
    apparentWeight: number
    scaleReading: number
  }) => void
}
```

**Physics:**
- Apparent weight: W_apparent = m(g + a)
- Scale reading = Normal force = W_apparent
- When a = -g: "weightless"
- When a < -g: "negative" apparent weight (falling faster than freefall)

**Visual Elements:**
- Elevator box (transparent walls)
- Person figure (simple humanoid shape)
- Scale platform with digital display
- Force arrows: Weight, Normal force
- Height indicator on side

**Camera Settings:**
```typescript
position: [6, 5, 8]
target: [0, 5, 0]
```

### 2.3 TwoRopeTension Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface TwoRopeTensionProps {
  mass: number                      // kg
  ropeAngle: number                 // degrees from vertical (symmetric)
  resetTrigger: number
  onUpdate: (data: {
    position: THREE.Vector3
    tension: number
    angle: number
  }) => void
}
```

**Physics:**
- Equilibrium: 2T·cos(θ) = mg
- Tension: T = mg / (2·cos(θ))
- As θ → 90°, T → ∞

**Visual Elements:**
- Ceiling bar
- Two anchor points
- Two ropes at symmetric angles
- Hanging mass
- Tension vectors on each rope
- Weight vector on mass
- Angle labels

**Camera Settings:**
```typescript
position: [0, 3, 8]
target: [0, 2, 0]
```

### 2.4 Update Exports & Scene Detection

**File:** `frontend/src/physics3d/index.ts`
- [ ] Export `HorizontalPush`
- [ ] Export `Elevator`
- [ ] Export `TwoRopeTension`

**File:** `frontend/src/Third.tsx`
- [ ] Add `horizontal_push` scene type detection
- [ ] Add `elevator` scene type detection
- [ ] Add `rope_tension` scene type detection
- [ ] Add rendering logic for each new scene

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `cd frontend && npm run build`
- [ ] No console errors for horizontal_push scene
- [ ] No console errors for elevator scene
- [ ] No console errors for rope_tension scene

#### Manual Verification:
- [ ] "6kg box pushed with 24N, μ=0.20" → shows correct acceleration, friction state
- [ ] "Person on scale in elevator accelerating upward" → scale shows increased weight
- [ ] "Mass hangs from two ropes at 30° from vertical" → correct tension calculated
- [ ] All force arrows display correctly
- [ ] Pause/replay/reset work correctly

---

## Phase 3: Pulley Systems

### Overview
Implement Atwood machine and table-edge pulley systems - fundamental connected-body problems.

### 3.1 AtwoodMachine Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface AtwoodMachineProps {
  mass1: number                     // kg (left side)
  mass2: number                     // kg (right side)
  pulleyRadius: number              // m
  pulleyMass: number                // kg (0 = massless/ideal)
  initialHeight1: number            // m (left mass starting height)
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: (data: {
    position1: THREE.Vector3
    position2: THREE.Vector3
    velocity: number
    acceleration: number
    tension: number
    time: number
  }) => void
}
```

**Physics:**
- Massless pulley: a = (m2 - m1)g / (m1 + m2)
- With pulley inertia: a = (m2 - m1)g / (m1 + m2 + I/r²)
- Tension: T = m1(g + a) = m2(g - a)
- Constraint: when one goes up, other goes down same amount

**Visual Elements:**
- Pulley wheel at top (rotates)
- Rope over pulley
- Two hanging masses (different sizes based on mass)
- Tension labels on rope segments
- Force arrows on each mass

**Camera Settings:**
```typescript
position: [6, 4, 8]
target: [0, 3, 0]
```

### 3.2 TablePulley Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface TablePulleyProps {
  tableMass: number                 // kg (mass on table)
  hangingMass: number               // kg (mass hanging off edge)
  frictionCoefficient: number       // μ for table surface
  tableLength: number               // m
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: (data: {
    tableBlockPosition: THREE.Vector3
    hangingBlockPosition: THREE.Vector3
    velocity: number
    acceleration: number
    tension: number
    time: number
  }) => void
}
```

**Physics:**
- Acceleration: a = (m_hang·g - μ·m_table·g) / (m_table + m_hang)
- Tension: T = m_hang(g - a)
- Friction: f = μ·m_table·g
- System stops when: table block reaches edge OR hanging block hits ground

**Visual Elements:**
- Table surface with texture
- Block on table
- Pulley at table edge
- Rope connecting blocks
- Hanging mass
- Friction arrow on table block
- Tension arrows

**Camera Settings:**
```typescript
position: [8, 5, 8]
target: [2, 2, 0]
```

### 3.3 Update Exports & Scene Detection

**File:** `frontend/src/physics3d/index.ts`
- [ ] Export `AtwoodMachine`
- [ ] Export `TablePulley`

**File:** `frontend/src/Third.tsx`
- [ ] Add `atwood` scene type detection
- [ ] Add `table_pulley` scene type detection
- [ ] Update existing `pulley` detection to be more specific
- [ ] Add rendering logic for each

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `cd frontend && npm run build`
- [ ] No console errors for atwood scene
- [ ] No console errors for table_pulley scene

#### Manual Verification:
- [ ] "Two masses 2kg and 3kg connected over pulley" → correct acceleration
- [ ] "Block on frictionless table connected to hanging mass" → correct motion
- [ ] Pulley wheel rotates realistically
- [ ] Rope stays taut and constant length
- [ ] System stops at boundaries (ground, table edge)

---

## Phase 4: Collision Enhancements

### Overview
Enhance existing collision scene with impulse visualization, different mass support, and elastic/inelastic toggle.

### 4.1 Enhanced Collision Component

**File:** `frontend/src/physics3d/primitives.tsx`

Modify existing collision scene or create `EnhancedCollision`:

```typescript
interface EnhancedCollisionProps {
  mass1: number                     // kg
  velocity1: number                 // m/s (initial)
  mass2: number                     // kg
  velocity2: number                 // m/s (initial, often 0)
  collisionType: 'elastic' | 'inelastic'
  collisionDuration: number         // s (for impulse calc)
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: (data: {
    position1: THREE.Vector3
    position2: THREE.Vector3
    velocity1: THREE.Vector3
    velocity2: THREE.Vector3
    phase: 'before' | 'during' | 'after'
    impulse?: number
    averageForce?: number
    kineticEnergyBefore: number
    kineticEnergyAfter: number
    momentumBefore: number
    momentumAfter: number
    time: number
  }) => void
}
```

**Physics:**
- Elastic: v1' = ((m1-m2)v1 + 2m2v2)/(m1+m2), v2' = ((m2-m1)v2 + 2m1v1)/(m1+m2)
- Inelastic: v_final = (m1v1 + m2v2)/(m1+m2), objects stick
- Impulse: J = Δp = m·Δv
- Average force: F_avg = J / Δt
- KE conserved in elastic, momentum conserved in both

**Visual Elements:**
- Two objects (sized by mass)
- Velocity vectors before collision
- Momentum vectors (p = mv)
- During collision: impulse arrow
- After collision: new velocity vectors
- Energy bar comparison (before/after)
- Momentum bar comparison (should be equal)

**Camera Settings:**
```typescript
position: [0, 4, 12]
target: [0, 1, 0]
```

### 4.2 Update ControlPanel

**File:** `frontend/src/physics3d/ControlPanel.tsx`
- [ ] Add mass2 slider
- [ ] Add velocity2 slider
- [ ] Add collision type toggle (elastic/inelastic)
- [ ] Add collision duration input
- [ ] Display impulse in live data
- [ ] Display KE before/after in live data

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `cd frontend && npm run build`
- [ ] No console errors for collision scene

#### Manual Verification:
- [ ] "Cart A (2kg) at 5m/s hits Cart B (1kg) at rest" → correct final velocities
- [ ] Elastic collision: KE conserved (bars match)
- [ ] Inelastic collision: objects stick together
- [ ] "Baseball caught in 0.02s" → correct impulse and average force displayed
- [ ] Momentum bars equal before and after

---

## Phase 5: Rotational Motion

### Overview
Implement torque demonstration, seesaw equilibrium, rolling motion, and angular momentum conservation.

### 5.1 TorqueDemo Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface TorqueDemoProps {
  objectType: 'door' | 'rod'
  length: number                    // m
  mass: number                      // kg
  forcePosition: number             // m from pivot
  forceMagnitude: number            // N
  forceAngle: number                // degrees from perpendicular
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: (data: {
    angle: number
    angularVelocity: number
    angularAcceleration: number
    torque: number
    time: number
  }) => void
}
```

**Physics:**
- Torque: τ = r × F = rF·sin(θ)
- Moment of inertia (door about hinge): I = (1/3)ML²
- Angular acceleration: α = τ/I

**Visual Elements:**
- Door/rod that can rotate about one end
- Hinge point clearly marked
- Force arrow at adjustable position
- Lever arm (r) indicator
- Torque value display

### 5.2 Seesaw Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface SeesawProps {
  beamLength: number                // m
  beamMass: number                  // kg (usually negligible)
  leftMass: number                  // kg
  leftDistance: number              // m from pivot
  rightMass: number                 // kg
  rightDistance: number             // m from pivot
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: (data: {
    angle: number
    leftTorque: number
    rightTorque: number
    netTorque: number
    isBalanced: boolean
  }) => void
}
```

**Physics:**
- Equilibrium: τ_left = τ_right → m1·g·d1 = m2·g·d2
- Net torque: τ_net = m2·g·d2 - m1·g·d1
- If unbalanced: rotates toward heavier side

**Visual Elements:**
- Beam/plank
- Triangular pivot/fulcrum
- Masses at adjustable positions
- Torque arrows
- Balance indicator

### 5.3 RollingObject Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface RollingObjectProps {
  shape: 'solid_sphere' | 'hollow_sphere' | 'solid_cylinder' | 'hollow_cylinder' | 'hoop'
  mass: number                      // kg
  radius: number                    // m
  inclineAngle: number              // degrees
  inclineLength: number             // m
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: (data: {
    position: THREE.Vector3
    velocity: number
    angularVelocity: number
    time: number
    rotationalKE: number
    translationalKE: number
  }) => void
}
```

**Physics:**
- Moment of inertia varies by shape:
  - Solid sphere: I = (2/5)mr²
  - Hollow sphere: I = (2/3)mr²
  - Solid cylinder: I = (1/2)mr²
  - Hollow cylinder: I = mr²
  - Hoop: I = mr²
- Rolling acceleration: a = g·sin(θ) / (1 + I/(mr²))
- No-slip: v = ωr

**Visual Elements:**
- Incline/ramp
- Rolling object with visible rotation
- Velocity and ω indicators
- Energy bars: KE_trans, KE_rot, PE

### 5.4 AngularMomentum Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface AngularMomentumProps {
  scenario: 'skater' | 'turntable'
  initialMomentOfInertia: number    // kg·m²
  finalMomentOfInertia: number      // kg·m²
  initialAngularVelocity: number    // rad/s
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: (data: {
    momentOfInertia: number
    angularVelocity: number
    angularMomentum: number
    rotationalKE: number
    time: number
  }) => void
}
```

**Physics:**
- Conservation: L = Iω = constant
- When I decreases, ω increases: ω2 = ω1 × (I1/I2)
- KE changes: KE = (1/2)Iω² = L²/(2I)

**Visual Elements:**
- Skater figure with extendable arms, OR
- Turntable with movable masses
- Angular momentum display (constant)
- Angular velocity display (changes)
- KE display (changes)

### 5.5 Update Exports & Scene Detection

**File:** `frontend/src/physics3d/index.ts`
- [ ] Export `TorqueDemo`
- [ ] Export `Seesaw`
- [ ] Export `RollingObject`
- [ ] Export `AngularMomentum`

**File:** `frontend/src/Third.tsx`
- [ ] Add scene detection for `torque`, `seesaw`, `rolling`, `angular_momentum`

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `cd frontend && npm run build`

#### Manual Verification:
- [ ] Door torque demo shows different angular accelerations based on force position
- [ ] Seesaw balances when torques equal
- [ ] Solid sphere beats hoop in rolling race
- [ ] Skater spins faster when arms pulled in
- [ ] Angular momentum stays constant in conservation demo

---

## Phase 6: Work and Energy Visualizations

### Overview
Add energy bars and work calculations to existing and new scenes.

### 6.1 EnergyBars Component (Reusable)

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface EnergyBarsProps {
  kineticEnergy: number
  potentialEnergy: number
  springEnergy?: number
  dissipatedEnergy?: number
  totalEnergy: number
  position: [number, number, number]  // 3D position for bars
}
```

**Visual Elements:**
- Stacked/side-by-side bars
- Color-coded: KE (red), PE (blue), Spring PE (green), Dissipated (gray)
- Labels with values
- Total energy reference line

### 6.2 InclineSpring Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface InclineSpringProps {
  mass: number                      // kg
  inclineAngle: number              // degrees
  inclineLength: number             // m
  springConstant: number            // N/m
  frictionCoefficient: number       // μ (0 for frictionless)
  initialHeight: number             // m (where block starts)
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: (data: {
    position: THREE.Vector3
    velocity: number
    springCompression: number
    kineticEnergy: number
    gravitationalPE: number
    springPE: number
    dissipatedEnergy: number
    time: number
  }) => void
}
```

**Physics:**
- Energy conservation: mgh = (1/2)kx² + μmg·cos(θ)·d
- Maximum compression: solve for x
- May oscillate if friction is low

### 6.3 LiftingWork Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface LiftingWorkProps {
  mass: number                      // kg
  liftHeight: number                // m
  liftSpeed: number                 // m/s (constant)
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: (data: {
    position: THREE.Vector3
    workDone: number
    power: number
    time: number
  }) => void
}
```

**Physics:**
- Work: W = F·d = mgh (against gravity at constant speed)
- Power: P = W/t = Fv = mgv

### 6.4 Update Exports & Scene Detection

**File:** `frontend/src/physics3d/index.ts`
- [ ] Export `EnergyBars`
- [ ] Export `InclineSpring`
- [ ] Export `LiftingWork`

**File:** `frontend/src/Third.tsx`
- [ ] Add `incline_spring` scene type
- [ ] Add `lifting` scene type
- [ ] Add energy bar display to `incline` scene

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `cd frontend && npm run build`

#### Manual Verification:
- [ ] Incline scene shows energy bars with PE converting to KE
- [ ] Incline+spring shows correct maximum compression
- [ ] Lifting scene shows work = mgh
- [ ] Total energy bar stays constant (frictionless) or decreases (with friction)

---

## Phase 7: Problem Text Parsing Enhancements

### Overview
Add regex patterns for all new scene types and improve parameter extraction.

### 7.1 New Scene Type Detection

**File:** `frontend/src/Third.tsx` - Add to `determineSceneType()`:

```typescript
// Horizontal push with friction
if (lowerProblem.includes('push') &&
    (lowerProblem.includes('friction') || lowerProblem.includes('surface'))) {
  return 'horizontal_push';
}

// Elevator/apparent weight
if (lowerProblem.includes('elevator') ||
    (lowerProblem.includes('scale') && lowerProblem.includes('accelerat'))) {
  return 'elevator';
}

// Two-rope tension
if ((lowerProblem.includes('rope') || lowerProblem.includes('string')) &&
    lowerProblem.includes('hang') &&
    (lowerProblem.includes('angle') || lowerProblem.includes('two'))) {
  return 'rope_tension';
}

// Atwood machine
if (lowerProblem.includes('atwood') ||
    (lowerProblem.includes('pulley') &&
     lowerProblem.match(/two\s*(?:hanging\s*)?masses/i))) {
  return 'atwood';
}

// Table-edge pulley
if (lowerProblem.includes('pulley') &&
    (lowerProblem.includes('table') || lowerProblem.includes('edge'))) {
  return 'table_pulley';
}

// Force vectors
if (lowerProblem.match(/\d+\s*N\s*(east|west|north|south|up|down)/i)) {
  return 'force_vectors';
}

// Torque
if (lowerProblem.includes('torque') ||
    (lowerProblem.includes('door') && lowerProblem.includes('push'))) {
  return 'torque';
}

// Seesaw/lever
if (lowerProblem.includes('seesaw') || lowerProblem.includes('lever') ||
    lowerProblem.includes('balance') && lowerProblem.includes('pivot')) {
  return 'seesaw';
}

// Rolling motion
if (lowerProblem.match(/rolls?\s*(down|without\s*slip)/i)) {
  return 'rolling';
}

// Angular momentum
if (lowerProblem.includes('angular momentum') ||
    lowerProblem.match(/pulls?\s*(?:arms?\s*)?in/i) ||
    lowerProblem.includes('figure skater')) {
  return 'angular_momentum';
}

// Incline with spring
if ((lowerProblem.includes('incline') || lowerProblem.includes('ramp')) &&
    lowerProblem.includes('spring')) {
  return 'incline_spring';
}

// Vertical circular motion
if (lowerProblem.includes('vertical') && lowerProblem.includes('circle')) {
  return 'vertical_circular';
}

// Conical pendulum
if (lowerProblem.includes('conical') ||
    (lowerProblem.includes('pendulum') &&
     lowerProblem.includes('horizontal circle'))) {
  return 'conical_pendulum';
}

// Freefall (distinct from projectile)
if ((lowerProblem.includes('dropped') || lowerProblem.includes('falls')) &&
    !lowerProblem.includes('angle') &&
    !lowerProblem.includes('horizontal')) {
  return 'freefall';
}

// Lifting/work
if (lowerProblem.includes('lift') &&
    (lowerProblem.includes('work') || lowerProblem.includes('height'))) {
  return 'lifting';
}
```

### 7.2 New Regex Patterns for Parameter Extraction

**File:** `frontend/src/Third.tsx` - Add to `problemAnalysis`:

```typescript
// Applied force
const appliedForceMatch = problem.match(
  /push(?:ed|ing)?\s*(?:with)?\s*(?:a\s*)?(?:force\s*(?:of)?)?\s*(\d+(?:\.\d+)?)\s*N/i
);
if (appliedForceMatch) overrides.appliedForce = parseFloat(appliedForceMatch[1]);

// Static friction coefficient
const staticFrictionMatch = problem.match(
  /(?:static\s*)?(?:coefficient\s*(?:of)?\s*)?(?:static\s*)?friction[^.]*?μs?\s*(?:is|=|of)?\s*(\d+(?:\.\d+)?)/i
);
if (staticFrictionMatch) overrides.staticFrictionCoeff = parseFloat(staticFrictionMatch[1]);

// Kinetic friction coefficient
const kineticFrictionMatch = problem.match(
  /(?:kinetic\s*)?(?:coefficient\s*(?:of)?\s*)?(?:kinetic\s*)?friction[^.]*?μk?\s*(?:is|=|of)?\s*(\d+(?:\.\d+)?)/i
);
if (kineticFrictionMatch) overrides.kineticFrictionCoeff = parseFloat(kineticFrictionMatch[1]);

// Elevator acceleration with direction
const elevatorMatch = problem.match(
  /elevator[^.]*?accelerat\w*\s*(upward|downward|up|down)[^.]*?(\d+(?:\.\d+)?)\s*m\/s/i
);
if (elevatorMatch) {
  const direction = elevatorMatch[1].toLowerCase().startsWith('up') ? 1 : -1;
  overrides.elevatorAcceleration = direction * parseFloat(elevatorMatch[2]);
}

// Two masses (for collisions, pulleys)
const massMatches = [...problem.matchAll(
  /(?:mass|cart|block|object)\s*[AB12]?\s*\(?(\d+(?:\.\d+)?)\s*kg\)?/gi
)];
if (massMatches.length >= 1) overrides.mass = parseFloat(massMatches[0][1]);
if (massMatches.length >= 2) overrides.mass2 = parseFloat(massMatches[1][1]);

// Rolling object shape
const shapeMatch = problem.match(
  /(?:solid\s*)?(sphere|ball|cylinder|disk|hoop|ring)/i
);
if (shapeMatch) {
  const shape = shapeMatch[1].toLowerCase();
  if (shape === 'ball') overrides.rollingShape = 'solid_sphere';
  else if (shape === 'ring') overrides.rollingShape = 'hoop';
  else if (shape === 'disk') overrides.rollingShape = 'solid_cylinder';
  else overrides.rollingShape = shape;
}

// Collision type
if (lowerProblem.includes('elastic') && !lowerProblem.includes('inelastic')) {
  overrides.collisionType = 'elastic';
} else if (lowerProblem.includes('inelastic') || lowerProblem.includes('stick')) {
  overrides.collisionType = 'inelastic';
}

// Collision duration (for impulse)
const durationMatch = problem.match(
  /(?:in|over|during|takes?)\s*(\d+(?:\.\d+)?)\s*(?:s|sec|ms)/i
);
if (durationMatch) {
  let duration = parseFloat(durationMatch[1]);
  if (problem.includes('ms')) duration /= 1000;
  overrides.collisionDuration = duration;
}
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `cd frontend && npm run build`

#### Manual Verification:
- [ ] Each problem type from physics.md correctly detected
- [ ] Parameters extracted accurately from problem text
- [ ] No false positives (e.g., "friction" in non-push problem)

---

## Phase 8: Control Panel Updates

### Overview
Add all new parameters and UI sections to the control panel.

### 8.1 Update PhysicsParams Interface

**File:** `frontend/src/physics3d/ControlPanel.tsx`

```typescript
export interface PhysicsParams {
  // === EXISTING ===
  gravity: number
  timeScale: number
  mass: number
  initialVelocityX: number
  initialVelocityY: number
  initialVelocityZ: number
  initialPositionX: number
  initialPositionY: number
  initialPositionZ: number
  restitution: number
  friction: number
  rampAngle: number
  springStiffness: number
  springDamping: number
  springRestLength: number
  pendulumLength: number
  pendulumAngle: number
  curveRadius: number
  bankAngle: number
  carSpeed: number
  acceleration: number
  maxTime: number

  // === NEW: Newton's Laws ===
  appliedForce: number              // N
  staticFrictionCoeff: number       // μs
  kineticFrictionCoeff: number      // μk
  elevatorAcceleration: number      // m/s²

  // === NEW: Rope/String ===
  ropeAngle: number                 // degrees from vertical
  stringLength: number              // m

  // === NEW: Pulley Systems ===
  mass2: number                     // kg (second mass)
  pulleyMass: number                // kg (0 = ideal)
  pulleyRadius: number              // m

  // === NEW: Collisions ===
  velocity2: number                 // m/s (second object)
  collisionType: 'elastic' | 'inelastic'
  collisionDuration: number         // s

  // === NEW: Rotational ===
  leverArm: number                  // m
  forceAngle: number                // degrees
  leftMass: number                  // kg
  leftDistance: number              // m from pivot
  rightMass: number                 // kg
  rightDistance: number             // m from pivot
  rollingShape: 'solid_sphere' | 'hollow_sphere' | 'solid_cylinder' | 'hollow_cylinder' | 'hoop'
  objectRadius: number              // m
  initialMomentOfInertia: number    // kg·m²
  finalMomentOfInertia: number      // kg·m²

  // === NEW: Spring Orientation ===
  springOrientation: 'horizontal' | 'vertical'

  // === NEW: Circular Motion ===
  circularPlane: 'horizontal' | 'vertical' | 'conical'
}
```

### 8.2 Add Default Values

**File:** `frontend/src/physics3d/ControlPanel.tsx`

```typescript
export const defaultParams: PhysicsParams = {
  // ... existing defaults ...

  // Newton's Laws
  appliedForce: 10,
  staticFrictionCoeff: 0.5,
  kineticFrictionCoeff: 0.3,
  elevatorAcceleration: 2,

  // Rope/String
  ropeAngle: 30,
  stringLength: 1,

  // Pulley Systems
  mass2: 2,
  pulleyMass: 0,
  pulleyRadius: 0.1,

  // Collisions
  velocity2: 0,
  collisionType: 'elastic',
  collisionDuration: 0.1,

  // Rotational
  leverArm: 1,
  forceAngle: 90,
  leftMass: 2,
  leftDistance: 1,
  rightMass: 2,
  rightDistance: 1,
  rollingShape: 'solid_sphere',
  objectRadius: 0.2,
  initialMomentOfInertia: 1,
  finalMomentOfInertia: 0.5,

  // Spring
  springOrientation: 'horizontal',

  // Circular
  circularPlane: 'horizontal',
}
```

### 8.3 Add New UI Sections

Add collapsible sections for:
- [ ] **Forces** - appliedForce, staticFrictionCoeff, kineticFrictionCoeff
- [ ] **Elevator** - elevatorAcceleration
- [ ] **Rope/Tension** - ropeAngle, stringLength
- [ ] **Pulley** - mass2, pulleyMass
- [ ] **Collision** - mass2, velocity2, collisionType, collisionDuration
- [ ] **Torque** - leverArm, forceAngle
- [ ] **Seesaw** - leftMass, leftDistance, rightMass, rightDistance
- [ ] **Rolling** - rollingShape, objectRadius

### 8.4 Enhanced Live Data Display

Add to live data section:
- [ ] Impulse (during collision)
- [ ] Average force (during collision)
- [ ] Tension (for pulley/rope scenes)
- [ ] Torque (for rotational scenes)
- [ ] Angular momentum (for conservation scenes)
- [ ] Energy breakdown (KE, PE, Spring PE)

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `cd frontend && npm run build`

#### Manual Verification:
- [ ] All new sections appear in control panel
- [ ] Sliders have appropriate ranges
- [ ] Live data updates correctly for each scene type
- [ ] Default values are sensible

---

## Phase 9: Error Handling & Fallbacks

### Overview
Add graceful handling for unparseable problems and edge cases.

### 9.1 GenericPhysics Fallback Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface GenericPhysicsProps {
  mass: number
  showForceArrows: boolean
  enableGravity: boolean
  message?: string
  resetTrigger: number
  isPaused: boolean
  onUpdate: callback
}
```

**Visual Elements:**
- Simple interactive box/sphere
- Optional gravity
- Force arrow toggles
- Info message: "Scene type could not be determined"

### 9.2 Update Scene Type Detection Fallback

**File:** `frontend/src/Third.tsx`

```typescript
function determineSceneType(animationData: any, problem: string): string {
  // ... all existing detection logic ...

  // Fallback: check for any physics keywords
  const physicsKeywords = ['mass', 'force', 'velocity', 'acceleration',
                           'energy', 'momentum', 'gravity', 'friction'];
  const hasPhysicsContent = physicsKeywords.some(kw =>
    problem.toLowerCase().includes(kw)
  );

  if (hasPhysicsContent) {
    console.warn('Could not determine specific scene type, using generic');
    return 'generic_physics';
  }

  console.warn('No physics content detected');
  return 'generic_demo';
}
```

### 9.3 Parameter Validation

**File:** `frontend/src/Third.tsx`

```typescript
function validateParams(params: PhysicsParams): PhysicsParams {
  return {
    ...params,
    mass: Math.max(0.01, params.mass),
    mass2: Math.max(0.01, params.mass2),
    gravity: Math.max(0, Math.min(20, params.gravity)),
    friction: Math.max(0, Math.min(2, params.friction)),
    staticFrictionCoeff: Math.max(0, Math.min(2, params.staticFrictionCoeff)),
    kineticFrictionCoeff: Math.max(0, Math.min(2, params.kineticFrictionCoeff)),
    rampAngle: Math.max(0, Math.min(89, params.rampAngle)),
    springStiffness: Math.max(1, params.springStiffness),
    // ... etc
  };
}
```

### 9.4 Unit Conversion Utility

**File:** `frontend/src/utils/units.ts` (new file)

```typescript
export function convertToSI(value: number, unit: string): number {
  const conversions: Record<string, number> = {
    // Mass
    'lb': 0.453592,
    'lbs': 0.453592,
    'g': 0.001,

    // Length
    'ft': 0.3048,
    'feet': 0.3048,
    'in': 0.0254,
    'inch': 0.0254,
    'cm': 0.01,
    'mm': 0.001,
    'km': 1000,

    // Velocity
    'mph': 0.44704,
    'km/h': 0.27778,
    'kmh': 0.27778,
    'ft/s': 0.3048,

    // Force
    'lbf': 4.44822,
    'dyn': 0.00001,
  };

  return value * (conversions[unit.toLowerCase()] || 1);
}

export function parseValueWithUnit(text: string): { value: number; unit: string } {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(\w+\/?\w*)?/);
  if (!match) return { value: 0, unit: '' };

  return {
    value: parseFloat(match[1]),
    unit: match[2] || ''
  };
}
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `cd frontend && npm run build`

#### Manual Verification:
- [ ] Unparseable problem shows generic scene with message
- [ ] Invalid parameters are clamped to valid ranges
- [ ] Non-SI units converted correctly (e.g., "5 ft" → 1.524 m)

---

## Phase 10: Compound/Multi-Concept Scenes

### Overview
Handle problems that combine multiple physics concepts.

### 10.1 InclinePulley Component

**File:** `frontend/src/physics3d/primitives.tsx`

```typescript
interface InclinePulleyProps {
  inclineMass: number               // kg (on ramp)
  hangingMass: number               // kg (hanging)
  inclineAngle: number              // degrees
  frictionCoefficient: number       // μ
  pulleyMass: number                // kg (0 = ideal)
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: callback
}
```

**Physics:**
- Net force determines direction
- a = (m_hang·g - m_incline·g·sin(θ) - μ·m_incline·g·cos(θ)) / (m_hang + m_incline)
- Positive a: hanging mass descends
- Negative a: block slides down ramp

### 10.2 Scene Combination Detection

**File:** `frontend/src/Third.tsx`

```typescript
interface SceneConfig {
  primaryScene: string;
  features: {
    showEnergyBars: boolean;
    showMomentum: boolean;
    includeFriction: boolean;
    includeSpring: boolean;
    includePulley: boolean;
  };
}

function analyzeCompoundProblem(problem: string): SceneConfig {
  const lower = problem.toLowerCase();

  const hasIncline = lower.includes('incline') || lower.includes('ramp');
  const hasSpring = lower.includes('spring');
  const hasPulley = lower.includes('pulley');
  const hasFriction = lower.includes('friction');
  const mentionsEnergy = lower.includes('energy') || lower.includes('work');
  const mentionsMomentum = lower.includes('momentum');

  // Incline + Spring
  if (hasIncline && hasSpring) {
    return {
      primaryScene: 'incline_spring',
      features: { showEnergyBars: true, includeFriction: hasFriction, ... }
    };
  }

  // Incline + Pulley
  if (hasIncline && hasPulley) {
    return {
      primaryScene: 'incline_pulley',
      features: { includeFriction: hasFriction, ... }
    };
  }

  // ... more combinations
}
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles: `cd frontend && npm run build`

#### Manual Verification:
- [ ] "Block on incline connected to hanging mass via pulley" works correctly
- [ ] Compound problems use appropriate combined scene
- [ ] Energy bars show when energy concepts are involved

---

## Complete Sample Problems Mapping

| # | Physics.md Problem | Scene Type | Phase | Status |
|---|-------------------|------------|-------|--------|
| 1 | Car accelerates at 2.5 m/s² for 8s | `linear_kinematics` | - | ✅ Done |
| 2 | Ball thrown upward at 18 m/s | `freefall` | 1 | To Do |
| 3 | Runner v(t)=4t-2 | N/A | - | Out of Scope |
| 4 | Projectile at 30° with 20 m/s | `projectile` | - | ✅ Done |
| 5 | 6kg box pushed with 24N, μ=0.20 | `horizontal_push` | 2 | To Do |
| 6 | Person on scale in elevator | `elevator` | 2 | To Do |
| 7 | F1=10N east, F2=10N north | `force_vectors` | 2 | To Do |
| 8 | Mass from two ropes at angles | `rope_tension` | 2 | To Do |
| 9 | Lifting 5kg object 2.5m | `lifting` | 6 | To Do |
| 10 | 2kg block slides down ramp | `incline` | - | ✅ Done |
| 11 | Spring k=400 N/m compressed 0.15m | `spring` | 1 | To Do |
| 12 | Machine lifts 50kg at 500W | `lifting` | 6 | To Do |
| 13 | Baseball impulse in 0.02s | `collision` | 4 | To Do |
| 14 | Cart A (2kg) hits Cart B (1kg) | `collision` | 4 | To Do |
| 15 | Bullet embeds in block | `collision` (inelastic) | 4 | To Do |
| 16 | Door torque | `torque` | 5 | To Do |
| 17 | 3kg mass on string r=0.8m | `circular` | 1 | To Do |
| 18 | Seesaw equilibrium | `seesaw` | 5 | To Do |
| 19 | Mass-spring k=500 N/m, m=2kg | `spring` | 1 | To Do |
| 20 | Pendulum L=1.2m | `pendulum` | - | ✅ Done |
| 21 | Block on incline + spring | `incline_spring` | 6 | To Do |
| 22 | Projectile from cliff | `projectile` | - | ✅ Done |
| 23 | Ice skater pulls arms in | `angular_momentum` | 5 | To Do |
| 24 | Car on flat curve | `circular` | 1 | To Do |
| 25 | Car on banked curve | `banked_curve` | - | ✅ Done |
| 26 | Two masses over pulley | `atwood` | 3 | To Do |
| 27 | Block on table + hanging mass | `table_pulley` | 3 | To Do |
| 28 | Ball rolls down ramp | `rolling` | 5 | To Do |
| 29 | Block on incline + pulley | `incline_pulley` | 10 | To Do |

**Summary:**
- ✅ Done: 6 problems
- To Do: 23 problems
- Out of Scope: 1 problem (variable velocity function)
- Conceptual only (no visualization): ~6 problems from physics.md

---

## Implementation Order Summary

| Order | Phase | Description | Depends On |
|-------|-------|-------------|------------|
| 1 | Phase 1 | Spring & Circular Motion | None |
| 2 | Phase 2 | Newton's Laws | Phase 1 |
| 3 | Phase 3 | Pulley Systems | Phase 1 |
| 4 | Phase 4 | Collisions | Phase 1 |
| 5 | Phase 5 | Rotational Motion | Phase 1 |
| 6 | Phase 6 | Work & Energy | Phase 1, 5 |
| 7 | Phase 7 | Problem Parsing | Phases 1-6 |
| 8 | Phase 8 | Control Panel | Phases 1-6 |
| 9 | Phase 9 | Error Handling | Phase 7 |
| 10 | Phase 10 | Compound Scenes | All |

---

## References

- Problem specifications: `physics.md`
- Current primitives: `frontend/src/physics3d/primitives.tsx`
- Scene detection: `frontend/src/Third.tsx:215-560`
- Control panel: `frontend/src/physics3d/ControlPanel.tsx`
- Physics engine: @react-three/rapier (Rapier physics)
- 3D rendering: @react-three/fiber (Three.js)
- Implementation guide: `.claude/commands/implement_plan.md`
