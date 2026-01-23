# Physics Visualization - Comprehensive Implementation Plan

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

**File:** `frontend/src/Third.tsx`
- Update spring scene detection to use new component
- Add problem text parsing for spring constant `k` and mass

**File:** `frontend/src/physics3d/ControlPanel.tsx`
- Already has springStiffness, springDamping, springRestLength - verify they work

#### 1.2 Improve Circular Motion Scene
**Goal:** Support "3kg mass whirled in circle of radius 0.8m at 6 m/s" problems

**Changes Required:**

**File:** `frontend/src/physics3d/primitives.tsx`
- Create `CircularMotionObject` component:
  - Mass on string/rope moving in horizontal circle
  - Visual rope/string connecting to center pivot
  - Displays centripetal force vector
  - Reports velocity, centripetal acceleration, tension

**File:** `frontend/src/Third.tsx`
- Enhance circular scene to parse radius, speed, mass from problem text

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
  frictionCoefficient: number
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
- Calculate: a = (F - μmg) / m

**File:** `frontend/src/Third.tsx`
- Add `horizontal_push` scene type
- Parse "pushed with X N", "coefficient of friction X"

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
  onUpdate: callback
}
```

Features:
- Door that can rotate about hinge
- Adjustable force application point
- Show torque = r × F = rF sin(θ)
- Angular acceleration visualization

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

---

### Phase 7: Problem Text Parsing Enhancements

#### 7.1 New Regex Patterns Needed

**File:** `frontend/src/Third.tsx` in `problemAnalysis`:

```typescript
// Applied force detection
/push(?:ed|ing)?\s*(?:with)?\s*(?:a\s*)?(?:force\s*(?:of)?)?\s*(\d+(?:\.\d+)?)\s*N/i

// Friction coefficient
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
```

---

## Phase 8: Control Panel Updates

**File:** `frontend/src/physics3d/ControlPanel.tsx`

### New Parameters to Add:

```typescript
interface PhysicsParams {
  // ... existing params ...

  // Newton's Laws
  appliedForce: number        // N
  frictionCoefficient: number // μ
  elevatorAcceleration: number // m/s²

  // Rope tension
  ropeAngle: number           // degrees from vertical

  // Collision enhancements
  mass2: number               // kg (second object)
  velocity2: number           // m/s (second object initial)
  collisionTime: number       // s (for impulse calc)

  // Torque
  leverArm: number            // m
  forceAngle: number          // degrees

  // Seesaw
  leftMass: number            // kg
  leftDistance: number        // m from pivot
  rightMass: number           // kg
  rightDistance: number       // m from pivot
}
```

### New Control Panel Sections:

1. **Forces** (for horizontal push, elevator)
2. **Collision Details** (masses, velocities, collision time)
3. **Rotational** (torque, lever arm)
4. **Equilibrium** (seesaw masses and distances)

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

---

## Implementation Priority Order

1. **Phase 1** - Enhance Spring/Circular (most common physics problems)
2. **Phase 2** - Newton's Laws (fundamental physics)
3. **Phase 7** - Problem parsing (enables all new scenes)
4. **Phase 4** - Collision enhancements (builds on existing)
5. **Phase 3** - Force vectors (visual clarity)
6. **Phase 5** - Rotational motion (new physics domain)
7. **Phase 6** - Work/Energy (enhances existing)
8. **Phase 8** - Control panel (polish)

---

## Sample Problems Mapping

| Physics.md Problem | Scene Type | Status |
|-------------------|------------|--------|
| Car accelerates at 2.5 m/s² for 8s | `linear_kinematics` | ✅ Done |
| Ball thrown upward at 18 m/s | `projectile` | ✅ Done |
| Projectile at 30° with 20 m/s | `projectile` | ✅ Done |
| 6kg box pushed with 24N, μ=0.20 | `horizontal_push` | Phase 2 |
| Person on scale in elevator | `elevator` | Phase 2 |
| F1=10N east, F2=10N north | `force_vectors` | Phase 3 |
| Mass from two ropes at angles | `rope_tension` | Phase 2 |
| Mass-spring k=500 N/m, m=2kg | `spring` | Phase 1 |
| Pendulum L=1.2m | `pendulum` | ✅ Done |
| Cart A (2kg) at 5m/s hits Cart B | `collision` | Phase 4 |
| Baseball caught in 0.02s | `collision` | Phase 4 |
| 3kg whirled in circle r=0.8m | `circular` | Phase 1 |
| Door pushed at handle vs hinge | `torque` | Phase 5 |
| Seesaw equilibrium | `seesaw` | Phase 5 |
| 2kg slides down frictionless ramp | `incline` | ✅ Done (enhance Phase 6) |
| Block on rough incline + spring | `incline_spring` | Phase 6 |
| Projectile from cliff | `projectile` + Cliff | ✅ Done |
| Car rounds banked curve | `banked_curve` | ✅ Done |

---

## References

- Problem specifications: `physics.md`
- Current primitives: `frontend/src/physics3d/primitives.tsx`
- Scene detection: `frontend/src/Third.tsx:215-560`
- Control panel: `frontend/src/physics3d/ControlPanel.tsx`
- Physics engine: @react-three/rapier (Rapier physics)
- 3D rendering: @react-three/fiber (Three.js)
