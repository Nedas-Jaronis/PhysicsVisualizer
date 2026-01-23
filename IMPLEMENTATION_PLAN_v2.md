# Physics Visualization - Comprehensive Implementation Plan (v2)

## Overview

This plan outlines the implementation of physics simulations to support all problem types in `physics.md`. The goal is to create visual, interactive 3D simulations for Physics 1 concepts.

## Current State Analysis

### Already Implemented (12 components)
- `PhysicsBox`, `PhysicsSphere` - Basic rigid bodies
- `Ground`, `Ramp`, `Wall`, `Cliff` - Environment elements
- `Pendulum` - Simple harmonic motion
- `Spring` - Spring visualization (basic)
- `Projectile` - Trajectory tracking
- `BankedCurve`, `Car` - Circular motion on banked track
- `StraightRoad`, `LinearCar` - Linear kinematics
- `ForceArrow` - Force visualization (visual only)

### Scene Types Detected (10 types)
`pendulum`, `spring`, `banked_curve`, `circular`, `pulley`, `incline`, `collision`, `projectile`, `freefall`, `rotation`

---

## What We're NOT Doing

- Wave/sound visualization (requires different rendering approach)
- Electric/magnetic fields (Physics 2 content)
- Fluid dynamics
- Complex multi-body constraints beyond simple collisions
- Rocket propulsion with variable mass

---

## Implementation Phases

### Phase 1: Enhance Existing Components (Priority: High)

#### 1.1 Improve Spring/Oscillation Scene
**Goal:** Support "mass-spring system with k=500 N/m and m=2kg" problems

**Changes Required:**

**File:** `frontend/src/physics3d/primitives.tsx`
- Create `MassSpringSystem` component that:
  - Shows a fixed wall/ceiling anchor point
  - Renders a visual spring (coil geometry)
  - Has a mass bob that oscillates
  - Uses SHM equations: x(t) = A*cos(ωt + φ), where ω = √(k/m)
  - Reports position, velocity, period to onUpdate
  - **NEW:** Support both horizontal AND vertical orientations
  - **NEW:** For vertical springs, calculate shifted equilibrium: x_eq = mg/k

**File:** `frontend/src/Third.tsx`
- Update spring scene detection to use new component
- Add problem text parsing for spring constant `k` and mass
- **NEW:** Detect orientation from keywords ("hanging", "vertical", "horizontal")

**File:** `frontend/src/physics3d/ControlPanel.tsx`
- Already has springStiffness, springDamping, springRestLength - verify they work
- **NEW:** Add orientation toggle (horizontal/vertical)

#### 1.2 Improve Circular Motion Scene
**Goal:** Support "3kg mass whirled in circle of radius 0.8m at 6 m/s" problems

**Changes Required:**

**File:** `frontend/src/physics3d/primitives.tsx`
- Create `CircularMotionObject` component:
  - Mass on string/rope moving in horizontal circle
  - Visual rope/string connecting to center pivot
  - Displays centripetal force vector
  - Reports velocity, centripetal acceleration, tension

**NEW - Vertical Circular Motion:**
- Create `VerticalCircularMotion` component:
  - Mass on string in vertical plane (like ball on rope swung overhead)
  - Tension varies with position: T = mv²/r + mg·cos(θ)
  - At top: T_min = mv²/r - mg
  - At bottom: T_max = mv²/r + mg
  - Critical speed calculation: v_min = √(gr) at top
  - Visual indicator when string would go slack

**NEW - Conical Pendulum:**
- Create `ConicalPendulum` component:
  - Mass traces horizontal circle while string sweeps cone
  - String at angle θ from vertical
  - Period T = 2π√(L·cos(θ)/g)
  - Show tension and weight vectors

**File:** `frontend/src/Third.tsx`
- Enhance circular scene to parse radius, speed, mass from problem text
- **NEW:** Detect vertical vs horizontal from "vertical circle", "swung overhead", etc.
- **NEW:** Detect conical pendulum from "conical", "traces horizontal circle"

---

### Phase 2: Newton's Laws Visualizations (Priority: High)

#### 2.1 Horizontal Surface with Applied Force
**Goal:** Support "6kg box pushed with 24N, friction coefficient 0.20"

**New Components:**

**File:** `frontend/src/physics3d/primitives.tsx`
```typescript
// HorizontalPushScene - box on flat surface with applied force
interface HorizontalPushProps {
  mass: number
  appliedForce: number
  staticFrictionCoefficient: number   // NEW: μs
  kineticFrictionCoefficient: number  // NEW: μk
  resetTrigger: number
  timeScale: number
  isPaused: boolean
  onUpdate: callback
}
```

Features:
- Flat ground surface
- Box that accelerates based on F_net = F_applied - f_friction
- Visual force arrows for: Applied force, Friction, Normal, Weight
- **NEW:** Static vs Kinetic friction logic:
  - If F_applied ≤ μs·N: object stays stationary, f_s = F_applied
  - If F_applied > μs·N: object moves, f_k = μk·N
  - Calculate: a = (F - μk·mg) / m (only when moving)
- **NEW:** Visual indicator showing "static" vs "kinetic" friction state

**File:** `frontend/src/Third.tsx`
- Add `horizontal_push` scene type
- Parse "pushed with X N", "coefficient of friction X"
- **NEW:** Parse "coefficient of static friction" vs "coefficient of kinetic friction"
- **NEW:** Default μs = 1.2 × μk if only one is given

#### 2.2 Elevator/Apparent Weight Scene
**Goal:** Support "person on scale in accelerating elevator"

**New Components:**

**File:** `frontend/src/physics3d/primitives.tsx`
```typescript
// ElevatorScene
interface ElevatorProps {
  personMass: number
  elevatorAcceleration: number  // positive = up, negative = down
  resetTrigger: number
  onUpdate: callback
}
```

Features:
- Elevator box that moves up/down
- Person standing on scale inside
- Scale display showing apparent weight: W_apparent = m(g + a)
- Visual force arrows for actual weight and normal force

**File:** `frontend/src/Third.tsx`
- Add `elevator` scene type
- Parse "accelerating upward/downward at X m/s²"

#### 2.3 Two-Rope Tension Scene
**Goal:** Support "mass hangs from two ropes at equal angles"

**New Components:**

**File:** `frontend/src/physics3d/primitives.tsx`
```typescript
// TwoRopeTension
interface TwoRopeProps {
  mass: number
  ropeAngle: number  // angle from vertical
  onUpdate: callback
}
```

Features:
- Ceiling anchor points
- Two ropes at symmetric angles
- Hanging mass
- Tension vectors on each rope
- Display: T = mg / (2 * cos(θ))

---

### Phase 2B: Pulley Systems (Priority: High) **[NEW PHASE]**

#### 2B.1 Atwood Machine
**Goal:** Support "Two masses connected by rope over pulley"

**New Components:**

**File:** `frontend/src/physics3d/primitives.tsx`
```typescript
// AtwoodMachine
interface AtwoodMachineProps {
  mass1: number              // kg (left side)
  mass2: number              // kg (right side)
  pulleyRadius: number       // m (for optional rotational inertia)
  pulleyMass: number         // kg (0 = massless pulley)
  ropeLength: number         // m
  resetTrigger: number
  isPaused: boolean
  timeScale: number
  onUpdate: callback
}
```

Features:
- Pulley wheel at top (visual, rotates)
- Two hanging masses connected by rope
- Rope maintains constant total length
- Physics: a = (m2 - m1)g / (m1 + m2) for massless pulley
- With pulley mass: a = (m2 - m1)g / (m1 + m2 + I/r²)
- Tension display: T = m1(g + a) = m2(g - a)
- Force arrows on each mass

#### 2B.2 Table-Edge Pulley System
**Goal:** Support "Block on table connected to hanging mass"

**New Components:**

**File:** `frontend/src/physics3d/primitives.tsx`
```typescript
// TablePulleySystem
interface TablePulleyProps {
  tableMass: number          // kg (mass on table)
  hangingMass: number        // kg (mass hanging off edge)
  frictionCoefficient: number // μ for table surface
  tableLength: number        // m
  resetTrigger: number
  isPaused: boolean
  timeScale: number
  onUpdate: callback
}
```

Features:
- Horizontal table surface
- Block on table connected by rope to pulley at edge
- Second mass hanging vertically
- Physics: a = (m_hang·g - μ·m_table·g) / (m_table + m_hang)
- Tension: T = m_hang(g - a)
- Friction force arrow on table block
- System stops when table block reaches edge (or hanging block hits ground)

**File:** `frontend/src/Third.tsx`
- Add `pulley` scene type (already detected, needs implementation)
- Add `atwood` scene type
- Add `table_pulley` scene type
- Parse patterns:
  - "masses of X kg and Y kg connected by rope"
  - "over a pulley"
  - "block on table", "hanging off edge"
  - "frictionless pulley" vs pulley with mass

---

### Phase 2C: Freefall Scene (Priority: High) **[NEW PHASE]**

#### 2C.1 Freefall Visualization
**Goal:** Support "Object dropped from height h" and "Object thrown straight up/down"

**New Components:**

**File:** `frontend/src/physics3d/primitives.tsx`
```typescript
// FreefallScene
interface FreefallProps {
  mass: number
  initialHeight: number      // m
  initialVelocity: number    // m/s (+ up, - down, 0 = dropped)
  showAirResistance: boolean // optional drag visualization
  resetTrigger: number
  isPaused: boolean
  timeScale: number
  onUpdate: callback
}
```

Features:
- Object falling/rising vertically
- Height markers or ruler alongside
- Velocity arrow that grows/shrinks
- Equations: y(t) = y0 + v0·t - ½gt², v(t) = v0 - gt
- Ground collision detection
- Display: current height, velocity, time, max height (if thrown up)
- **Distinct from projectile:** No horizontal motion, simplified view

**File:** `frontend/src/Third.tsx`
- Implement `freefall` scene (already detected, needs implementation)
- Parse patterns:
  - "dropped from", "falls from height"
  - "thrown straight up/down"
  - "initial velocity of X m/s upward/downward"

---

### Phase 3: Force Vector Addition (Priority: Medium)

#### 3.1 Force Vector Visualization
**Goal:** Support "F1=10N east, F2=10N north, find net force"

**New Components:**

**File:** `frontend/src/physics3d/primitives.tsx`
```typescript
// ForceVectorScene
interface ForceVectorProps {
  forces: Array<{magnitude: number, direction: number}>  // direction in degrees
  showResultant: boolean
  onUpdate: callback
}
```

Features:
- Multiple colored force arrows from origin
- Resultant vector (different color, dashed)
- Labels showing magnitude and direction
- Component breakdown (x, y components)

---

### Phase 4: Collision Enhancements (Priority: Medium)

#### 4.1 Impulse Visualization
**Goal:** Support "baseball caught in 0.02s, find impulse and average force"

**Enhancements to collision scene:**

**File:** `frontend/src/physics3d/primitives.tsx`
- Add impulse calculation: J = Δp = m(v_f - v_i)
- Add average force calculation: F_avg = J / Δt
- Visual momentum vectors before/after
- Display impulse value during collision

**File:** `frontend/src/physics3d/ControlPanel.tsx`
- Add collision time parameter
- Add impulse display in live data

#### 4.2 Two-Cart Collision
**Goal:** Support "Cart A (2kg) at 5m/s hits Cart B (1kg) at rest"

**Changes:**
- Allow different masses for each object in collision scene
- Show momentum conservation: m1*v1 + m2*v2 = m1*v1' + m2*v2'
- Display KE before/after for elastic check
- **NEW:** Toggle between elastic and inelastic collision types
- **NEW:** For inelastic: objects stick together, v_final = (m1v1 + m2v2)/(m1+m2)

---

### Phase 5: Rotational Motion (Priority: Medium)

#### 5.1 Torque/Door Visualization
**Goal:** Support "door pushed at handle vs near hinge"

**New Components:**

**File:** `frontend/src/physics3d/primitives.tsx`
```typescript
// TorqueDemo
interface TorqueDemoProps {
  doorLength: number
  forcePosition: number  // distance from hinge
  forceMagnitude: number
  forceAngle: number
  momentOfInertia: number  // NEW: I = (1/3)ML² for door
  onUpdate: callback
}
```

Features:
- Door that can rotate about hinge
- Adjustable force application point
- Show torque = r × F = rF sin(θ)
- Angular acceleration: α = τ/I
- **NEW:** Display moment of inertia for different objects

#### 5.2 Seesaw/Lever Equilibrium
**Goal:** Support "seesaw in rotational equilibrium"

**New Components:**

**File:** `frontend/src/physics3d/primitives.tsx`
```typescript
// SeesawScene
interface SeesawProps {
  leftMass: number
  leftDistance: number
  rightMass: number
  rightDistance: number
  onUpdate: callback
}
```

Features:
- Pivoting beam/plank
- Masses at adjustable positions
- Show τ_left = τ_right for equilibrium
- Tilt animation when unbalanced

#### 5.3 Rolling Motion **[NEW]**
**Goal:** Support "ball/cylinder/hoop rolling down incline"

**New Components:**

**File:** `frontend/src/physics3d/primitives.tsx`
```typescript
// RollingObject
interface RollingObjectProps {
  shape: 'sphere' | 'cylinder' | 'hoop' | 'disk'
  mass: number
  radius: number
  inclineAngle: number
  inclineLength: number
  resetTrigger: number
  isPaused: boolean
  timeScale: number
  onUpdate: callback
}
```

Features:
- Object rolls (not slides) down incline
- Visual rotation matching translation (no slip condition)
- Different moments of inertia:
  - Solid sphere: I = (2/5)mr²
  - Solid cylinder/disk: I = (1/2)mr²
  - Hoop/thin ring: I = mr²
- Acceleration: a = g·sin(θ) / (1 + I/(mr²))
- Race comparison: sphere wins, then cylinder, then hoop
- Energy: KE_total = KE_translational + KE_rotational

**File:** `frontend/src/Third.tsx`
- Add `rolling` scene type
- Parse "rolls down", "rolling without slipping"
- Detect shape from "sphere", "ball", "cylinder", "hoop", "disk"

#### 5.4 Angular Momentum Conservation **[NEW]**
**Goal:** Support "figure skater pulls arms in" and "rotating platform with walking person"

**New Components:**

**File:** `frontend/src/physics3d/primitives.tsx`
```typescript
// AngularMomentumDemo
interface AngularMomentumProps {
  scenario: 'skater' | 'platform' | 'collision'
  initialAngularVelocity: number  // rad/s
  initialMomentOfInertia: number  // kg·m²
  finalMomentOfInertia: number    // kg·m²
  resetTrigger: number
  isPaused: boolean
  onUpdate: callback
}
```

Features:
- Conservation: L = Iω = constant
- When I decreases, ω increases (and vice versa)
- Skater scenario: arms extend/contract, rotation speed changes
- Platform scenario: person walks toward/away from center
- Display: L, I, ω values throughout
- KE changes even though L is conserved (work done by internal forces)

**File:** `frontend/src/Third.tsx`
- Add `angular_momentum` scene type
- Parse "pulls arms in", "moment of inertia changes", "rotating platform"

---

### Phase 6: Work and Energy Visualization (Priority: Low)

#### 6.1 Work Done Lifting Object
**Goal:** Support "work done lifting 5kg object 2.5m"

**Enhancements:**

**File:** `frontend/src/physics3d/primitives.tsx`
- Add `LiftingScene` component
- Object moves upward at constant velocity
- Display: W = Fd = mgh
- Show force arrow, displacement arrow
- Energy bar showing PE increase

#### 6.2 Energy Conservation on Ramp
**Goal:** Support "2kg block slides down frictionless ramp from height 3m"

**Enhancements to incline scene:**
- Add energy bars (KE, PE, Total)
- Show: PE_top = KE_bottom
- Calculate v_bottom = √(2gh)
- Toggle for with/without friction
- **NEW:** With friction: E_lost = μmg·cos(θ)·d

#### 6.3 Incline with Spring **[NEW - fixes table inconsistency]**
**Goal:** Support "block slides down ramp and compresses spring at bottom"

**New Components:**

**File:** `frontend/src/physics3d/primitives.tsx`
```typescript
// InclineSpringScene
interface InclineSpringProps {
  mass: number
  inclineAngle: number
  inclineLength: number
  springConstant: number
  frictionCoefficient: number  // 0 for frictionless
  initialHeight: number
  resetTrigger: number
  isPaused: boolean
  timeScale: number
  onUpdate: callback
}
```

Features:
- Block starts at top of incline
- Spring at bottom of incline
- Energy conservation: mgh = ½kx² (frictionless)
- With friction: mgh = ½kx² + μmg·cos(θ)·d
- Block may oscillate or come to rest
- Energy bars: KE, PE_gravity, PE_spring, E_dissipated

**File:** `frontend/src/Third.tsx`
- Add `incline_spring` scene type (fixes table row 442)
- Parse "spring at bottom", "compresses spring"

#### 6.4 Power Calculations **[NEW]**
**Goal:** Support "motor lifts elevator at constant speed" and "car accelerates with power P"

**Enhancements:**

**File:** `frontend/src/physics3d/primitives.tsx`
- Add power display to relevant scenes
- P = W/t (average power)
- P = Fv (instantaneous power)
- P = τω (rotational power)

**File:** `frontend/src/physics3d/ControlPanel.tsx`
- Add power display in live data where applicable
- For elevator: P = mgv
- For car: P = Fv, with F = ma + friction

---

### Phase 7: Problem Text Parsing Enhancements

#### 7.1 New Regex Patterns Needed

**File:** `frontend/src/Third.tsx` in `problemAnalysis`:

```typescript
// Applied force detection
/push(?:ed|ing)?\s*(?:with)?\s*(?:a\s*)?(?:force\s*(?:of)?)?\s*(\d+(?:\.\d+)?)\s*N/i

// Static friction coefficient
/(?:coefficient\s*(?:of)?\s*static\s*friction|μs)\s*(?:is|=|of)?\s*(\d+(?:\.\d+)?)/i

// Kinetic friction coefficient
/(?:coefficient\s*(?:of)?\s*kinetic\s*friction|μk)\s*(?:is|=|of)?\s*(\d+(?:\.\d+)?)/i

// Generic friction (defaults to kinetic)
/(?:coefficient\s*(?:of)?\s*(?:kinetic\s*)?friction|μ[ks]?)\s*(?:is|=|of)?\s*(\d+(?:\.\d+)?)/i

// Elevator acceleration
/elevator\s*(?:is\s*)?accelerat(?:ing|es?)?\s*(upward|downward)\s*(?:at)?\s*(\d+(?:\.\d+)?)/i

// Spring constant
/(?:spring\s*constant|k)\s*(?:is|=)?\s*(\d+(?:\.\d+)?)\s*N\/m/i

// Rope angle
/(?:angle|angled?)\s*(?:of|at)?\s*(\d+(?:\.\d+)?)\s*(?:°|deg)/i

// Impulse time
/(?:in|over|during)\s*(\d+(?:\.\d+)?)\s*(?:s|sec)/i

// Two masses for collision
/(?:cart|object|mass)\s*[AB12]\s*\(?(\d+(?:\.\d+)?)\s*kg\)?/gi

// NEW: Pulley systems
/(?:connected\s*(?:by|with)\s*(?:a\s*)?(?:light\s*)?(?:rope|string|cord))/i
/(?:over\s*(?:a\s*)?(?:frictionless\s*)?(?:massless\s*)?pulley)/i
/(?:atwood|two\s*(?:hanging\s*)?masses)/i

// NEW: Dropped/freefall
/(?:dropped|falls?|falling)\s*(?:from\s*(?:a\s*)?(?:height\s*(?:of)?)?)\s*(\d+(?:\.\d+)?)\s*m/i
/(?:thrown\s*(?:straight\s*)?(up|down)(?:ward)?)/i

// NEW: Rolling objects
/(?:rolls?|rolling)\s*(?:down|without\s*slipping)/i
/(?:solid\s*)?(sphere|ball|cylinder|disk|hoop|ring)/i

// NEW: Angular momentum
/(?:moment\s*of\s*inertia|angular\s*momentum)/i
/(?:pulls?\s*(?:arms?\s*)?in|extends?\s*arms?)/i

// NEW: Power
/(?:power|watt|W)\s*(?:of|is|=)?\s*(\d+(?:\.\d+)?)\s*(?:W|kW|hp)?/i
/(?:at\s*(?:constant\s*)?(?:power|rate))/i
```

#### 7.2 New Scene Type Detection

**File:** `frontend/src/Third.tsx` in `determineSceneType`:

```typescript
// Horizontal push
if (lowerProblem.includes('push') && lowerProblem.includes('friction')) {
  return 'horizontal_push';
}

// Elevator
if (lowerProblem.includes('elevator') && lowerProblem.includes('scale')) {
  return 'elevator';
}

// Rope tension
if (lowerProblem.includes('rope') && lowerProblem.includes('hang')) {
  return 'rope_tension';
}

// Force vectors
if (lowerProblem.match(/\d+\s*N\s*(east|west|north|south)/i)) {
  return 'force_vectors';
}

// Torque
if (lowerProblem.includes('torque') || lowerProblem.includes('door')) {
  return 'torque';
}

// Seesaw
if (lowerProblem.includes('seesaw') || lowerProblem.includes('lever')) {
  return 'seesaw';
}

// NEW: Atwood machine
if (lowerProblem.includes('atwood') ||
    (lowerProblem.includes('pulley') && lowerProblem.match(/two\s*(?:hanging\s*)?masses/i))) {
  return 'atwood';
}

// NEW: Table pulley system
if (lowerProblem.includes('pulley') &&
    (lowerProblem.includes('table') || lowerProblem.includes('edge'))) {
  return 'table_pulley';
}

// NEW: Generic pulley (fallback)
if (lowerProblem.includes('pulley') && lowerProblem.includes('connected')) {
  return 'pulley';
}

// NEW: Freefall
if (lowerProblem.match(/(?:dropped|falls?\s*from)/i) &&
    !lowerProblem.includes('angle') && !lowerProblem.includes('horizontal')) {
  return 'freefall';
}

// NEW: Vertical circular motion
if (lowerProblem.includes('vertical') && lowerProblem.includes('circle')) {
  return 'vertical_circular';
}

// NEW: Conical pendulum
if (lowerProblem.includes('conical') ||
    (lowerProblem.includes('pendulum') && lowerProblem.includes('horizontal circle'))) {
  return 'conical_pendulum';
}

// NEW: Rolling motion
if (lowerProblem.match(/rolls?\s*(?:down|without)/i)) {
  return 'rolling';
}

// NEW: Angular momentum
if (lowerProblem.includes('angular momentum') ||
    lowerProblem.match(/pulls?\s*arms?\s*in/i)) {
  return 'angular_momentum';
}

// NEW: Incline with spring
if (lowerProblem.includes('incline') && lowerProblem.includes('spring')) {
  return 'incline_spring';
}
```

---

## Phase 8: Control Panel Updates

**File:** `frontend/src/physics3d/ControlPanel.tsx`

### New Parameters to Add:

```typescript
interface PhysicsParams {
  // ... existing params ...

  // Newton's Laws
  appliedForce: number             // N
  staticFrictionCoefficient: number  // μs (NEW)
  kineticFrictionCoefficient: number // μk (NEW)
  elevatorAcceleration: number     // m/s²

  // Rope tension
  ropeAngle: number                // degrees from vertical

  // Collision enhancements
  mass2: number                    // kg (second object)
  velocity2: number                // m/s (second object initial)
  collisionTime: number            // s (for impulse calc)
  collisionType: 'elastic' | 'inelastic'  // NEW

  // Torque
  leverArm: number                 // m
  forceAngle: number               // degrees

  // Seesaw
  leftMass: number                 // kg
  leftDistance: number             // m from pivot
  rightMass: number                // kg
  rightDistance: number            // m from pivot

  // NEW: Pulley systems
  pulleyMass: number               // kg (0 = massless)
  pulleyRadius: number             // m
  hangingMass: number              // kg
  tableMass: number                // kg

  // NEW: Circular motion variants
  circularPlane: 'horizontal' | 'vertical' | 'conical'
  stringLength: number             // m (for conical pendulum)

  // NEW: Rolling motion
  rollingShape: 'sphere' | 'cylinder' | 'hoop' | 'disk'
  objectRadius: number             // m

  // NEW: Angular momentum
  initialMomentOfInertia: number   // kg·m²
  finalMomentOfInertia: number     // kg·m²

  // NEW: Spring orientation
  springOrientation: 'horizontal' | 'vertical'
}
```

### New Control Panel Sections:

1. **Forces** (for horizontal push, elevator)
   - Applied force slider
   - Static friction coefficient
   - Kinetic friction coefficient
   - Friction state indicator (static/kinetic)

2. **Collision Details** (masses, velocities, collision time)
   - Collision type toggle (elastic/inelastic)

3. **Rotational** (torque, lever arm, rolling)
   - Shape selector for rolling objects
   - Moment of inertia display

4. **Equilibrium** (seesaw masses and distances)

5. **Pulley Systems** (NEW)
   - Pulley mass (0 for massless)
   - Connected masses

6. **Circular Motion Variants** (NEW)
   - Plane selector (horizontal/vertical/conical)
   - Critical speed indicator for vertical

---

## Phase 9: Error Handling & Fallbacks **[NEW PHASE]**

### 9.1 Unparseable Problem Fallback

**File:** `frontend/src/Third.tsx`

```typescript
// Default scene when problem cannot be parsed
const DEFAULT_SCENE = 'generic_demo';

function determineSceneType(problem: string): SceneType {
  // ... all detection logic ...

  // Fallback: try to detect ANY physics keywords
  const physicsKeywords = ['mass', 'force', 'velocity', 'acceleration',
                           'energy', 'momentum', 'gravity'];
  const hasPhysicsContent = physicsKeywords.some(kw =>
    lowerProblem.includes(kw));

  if (hasPhysicsContent) {
    // Show generic object that can be manipulated
    return 'generic_physics';
  }

  // Ultimate fallback
  console.warn('Could not determine scene type for problem:', problem);
  return 'generic_demo';
}
```

**New Component:**

**File:** `frontend/src/physics3d/primitives.tsx`
```typescript
// GenericPhysicsScene - fallback when specific scene can't be determined
interface GenericPhysicsProps {
  mass: number
  showForceArrows: boolean
  enableGravity: boolean
  onUpdate: callback
}
```

Features:
- Simple box/sphere that user can interact with
- Basic physics (gravity, ground collision)
- Force arrows that can be toggled
- Message: "Scene type could not be determined. Showing generic physics demo."

### 9.2 Parameter Validation

**File:** `frontend/src/Third.tsx`

```typescript
function validateAndSanitizeParams(params: PhysicsParams): PhysicsParams {
  return {
    ...params,
    mass: Math.max(0.1, params.mass),  // Minimum mass
    velocity: clamp(params.velocity, -100, 100),  // Reasonable velocity range
    angle: clamp(params.angle, 0, 90),  // Valid angles
    frictionCoefficient: clamp(params.frictionCoefficient, 0, 2),  // Physical range
    springConstant: Math.max(1, params.springConstant),  // Positive spring constant
    // ... etc
  };
}
```

### 9.3 Unit Conversion **[NEW]**

**File:** `frontend/src/utils/units.ts` (new file)

```typescript
// Convert common non-SI units to SI
export function parseValueWithUnits(text: string): { value: number, unit: string } {
  // Mass
  if (text.match(/(\d+(?:\.\d+)?)\s*lb/i)) {
    const lb = parseFloat(RegExp.$1);
    return { value: lb * 0.453592, unit: 'kg' };
  }

  // Length
  if (text.match(/(\d+(?:\.\d+)?)\s*(?:ft|feet)/i)) {
    const ft = parseFloat(RegExp.$1);
    return { value: ft * 0.3048, unit: 'm' };
  }
  if (text.match(/(\d+(?:\.\d+)?)\s*(?:in|inch)/i)) {
    const inches = parseFloat(RegExp.$1);
    return { value: inches * 0.0254, unit: 'm' };
  }

  // Speed
  if (text.match(/(\d+(?:\.\d+)?)\s*mph/i)) {
    const mph = parseFloat(RegExp.$1);
    return { value: mph * 0.44704, unit: 'm/s' };
  }
  if (text.match(/(\d+(?:\.\d+)?)\s*km\/h/i)) {
    const kmh = parseFloat(RegExp.$1);
    return { value: kmh / 3.6, unit: 'm/s' };
  }

  // Force
  if (text.match(/(\d+(?:\.\d+)?)\s*lbf/i)) {
    const lbf = parseFloat(RegExp.$1);
    return { value: lbf * 4.44822, unit: 'N' };
  }

  // Return as-is if SI or unrecognized
  const match = text.match(/(\d+(?:\.\d+)?)\s*(\w+)?/);
  return {
    value: parseFloat(match?.[1] || '0'),
    unit: match?.[2] || ''
  };
}
```

---

## Phase 10: Compound/Multi-Concept Scenes **[NEW PHASE]**

### 10.1 Scene Combination Strategy

Some problems combine multiple physics concepts. Strategy:

1. **Primary scene determination** - Pick the most complex/specific scene type
2. **Feature flags** - Enable additional features from secondary concepts
3. **Composite scenes** - For common combinations, create dedicated scenes

**File:** `frontend/src/Third.tsx`

```typescript
interface SceneConfig {
  primaryScene: SceneType;
  features: {
    showEnergyBars: boolean;
    showMomentumVectors: boolean;
    includeFriction: boolean;
    includeSpring: boolean;
    includePulley: boolean;
    // ... etc
  };
}

function analyzeCompoundProblem(problem: string): SceneConfig {
  const lowerProblem = problem.toLowerCase();

  // Check for compound indicators
  const hasIncline = lowerProblem.includes('incline') || lowerProblem.includes('ramp');
  const hasSpring = lowerProblem.includes('spring');
  const hasPulley = lowerProblem.includes('pulley');
  const hasFriction = lowerProblem.includes('friction');
  const mentionsEnergy = lowerProblem.includes('energy') || lowerProblem.includes('work');

  // Compound: Incline + Spring
  if (hasIncline && hasSpring) {
    return {
      primaryScene: 'incline_spring',
      features: { showEnergyBars: true, includeFriction: hasFriction, ... }
    };
  }

  // Compound: Incline + Pulley (classic problem)
  if (hasIncline && hasPulley) {
    return {
      primaryScene: 'incline_pulley',
      features: { includeFriction: hasFriction, ... }
    };
  }

  // ... more combinations
}
```

### 10.2 Incline-Pulley Combination Scene

**Goal:** Support "Block on incline connected via pulley to hanging mass"

**New Component:**

**File:** `frontend/src/physics3d/primitives.tsx`
```typescript
// InclinePulleySystem
interface InclinePulleyProps {
  inclineMass: number        // kg (mass on ramp)
  hangingMass: number        // kg (mass hanging)
  inclineAngle: number       // degrees
  frictionCoefficient: number
  pulleyMass: number         // 0 for massless
  resetTrigger: number
  isPaused: boolean
  timeScale: number
  onUpdate: callback
}
```

Features:
- Ramp with block
- Pulley at top of ramp
- Hanging mass connected by rope
- Physics depends on which mass "wins":
  - a = (m_hang·g - m_incline·g·sin(θ) - μ·m_incline·g·cos(θ)) / (m_hang + m_incline)
  - Direction determined by sign of numerator
- Tension in rope displayed
- Energy bars optional

---

## Verification Strategy

### Automated Checks:
- TypeScript compilation: `npm run build`
- No console errors in browser

### Manual Verification per Phase:
1. Enter sample problem from physics.md
2. Verify correct scene type detected
3. Verify parameters extracted correctly
4. Verify simulation animates correctly
5. Verify live data shows correct values
6. Verify pause/replay/reset work

### NEW: Edge Case Testing
- Test with non-SI units (should convert)
- Test with unparseable problems (should fallback gracefully)
- Test compound problems (should pick appropriate scene)
- Test boundary values (zero mass, extreme angles, etc.)

---

## Implementation Priority Order

1. **Phase 2B** - Pulley Systems (fills major gap, high-frequency problem type)
2. **Phase 2C** - Freefall (fills gap, simple to implement)
3. **Phase 1** - Enhance Spring/Circular (most common physics problems)
4. **Phase 2** - Newton's Laws (fundamental physics)
5. **Phase 9** - Error Handling (improves robustness)
6. **Phase 7** - Problem parsing (enables all new scenes)
7. **Phase 4** - Collision enhancements (builds on existing)
8. **Phase 3** - Force vectors (visual clarity)
9. **Phase 5** - Rotational motion (new physics domain)
10. **Phase 6** - Work/Energy (enhances existing)
11. **Phase 10** - Compound scenes (advanced combinations)
12. **Phase 8** - Control panel (polish)

---

## Sample Problems Mapping (Updated)

| Physics.md Problem | Scene Type | Status |
|-------------------|------------|--------|
| Car accelerates at 2.5 m/s² for 8s | `linear_kinematics` | ✅ Done |
| Ball thrown upward at 18 m/s | `freefall` | **Phase 2C** |
| Object dropped from 45m | `freefall` | **Phase 2C** |
| Projectile at 30° with 20 m/s | `projectile` | ✅ Done |
| 6kg box pushed with 24N, μ=0.20 | `horizontal_push` | Phase 2 |
| Person on scale in elevator | `elevator` | Phase 2 |
| F1=10N east, F2=10N north | `force_vectors` | Phase 3 |
| Mass from two ropes at angles | `rope_tension` | Phase 2 |
| Mass-spring k=500 N/m, m=2kg | `spring` | Phase 1 |
| Vertical spring with hanging mass | `spring` (vertical) | Phase 1 |
| Pendulum L=1.2m | `pendulum` | ✅ Done |
| Cart A (2kg) at 5m/s hits Cart B | `collision` | Phase 4 |
| Baseball caught in 0.02s | `collision` | Phase 4 |
| 3kg whirled in horizontal circle r=0.8m | `circular` | Phase 1 |
| Ball on string in vertical circle | `vertical_circular` | **Phase 1** |
| Conical pendulum | `conical_pendulum` | **Phase 1** |
| Door pushed at handle vs hinge | `torque` | Phase 5 |
| Seesaw equilibrium | `seesaw` | Phase 5 |
| Sphere rolls down ramp | `rolling` | **Phase 5.3** |
| Figure skater pulls arms in | `angular_momentum` | **Phase 5.4** |
| 2kg slides down frictionless ramp | `incline` | ✅ Done (enhance Phase 6) |
| Block on rough incline + spring | `incline_spring` | **Phase 6.3** |
| Motor lifts at constant speed | `elevator` + power | **Phase 6.4** |
| Projectile from cliff | `projectile` + Cliff | ✅ Done |
| Car rounds banked curve | `banked_curve` | ✅ Done |
| Two masses over pulley (Atwood) | `atwood` | **Phase 2B.1** |
| Block on table, hanging mass via pulley | `table_pulley` | **Phase 2B.2** |
| Block on incline connected to hanging mass via pulley | `incline_pulley` | **Phase 10.2** |
| Unparseable problem | `generic_physics` | **Phase 9.1** |

---

## New Scene Types Summary

| Scene Type | Phase | Description |
|------------|-------|-------------|
| `freefall` | 2C | Vertical drop/throw without horizontal motion |
| `atwood` | 2B.1 | Two masses connected over pulley |
| `table_pulley` | 2B.2 | Block on table connected to hanging mass |
| `vertical_circular` | 1.2 | Mass on string in vertical plane |
| `conical_pendulum` | 1.2 | Mass traces horizontal circle on angled string |
| `rolling` | 5.3 | Object rolling (not sliding) down incline |
| `angular_momentum` | 5.4 | Conservation of angular momentum demos |
| `incline_spring` | 6.3 | Block on ramp with spring at bottom |
| `incline_pulley` | 10.2 | Compound: incline + pulley system |
| `generic_physics` | 9.1 | Fallback scene for unparseable problems |

---

## References

- Problem specifications: `physics.md`
- Current primitives: `frontend/src/physics3d/primitives.tsx`
- Scene detection: `frontend/src/Third.tsx:215-560`
- Control panel: `frontend/src/physics3d/ControlPanel.tsx`
- Physics engine: @react-three/rapier (Rapier physics)
- 3D rendering: @react-three/fiber (Three.js)
