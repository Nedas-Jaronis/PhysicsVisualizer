import { useRef, useEffect } from 'react'
import { RigidBody, RapierRigidBody, useSpringJoint, BallCollider } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// ============================================
// PHYSICS BOX
// ============================================
interface PhysicsBoxProps {
  position?: [number, number, number]
  size?: [number, number, number]
  color?: string
  mass?: number
  velocity?: [number, number, number]
  restitution?: number
  friction?: number
  fixed?: boolean
  name?: string
  resetTrigger?: number
  timeScale?: number
  isPaused?: boolean
  onUpdate?: (data: { position: THREE.Vector3; velocity: THREE.Vector3; time: number }) => void
}

export function PhysicsBox({
  position = [0, 2, 0],
  size = [1, 1, 1],
  color = '#4080ff',
  mass = 1,
  velocity = [0, 0, 0],
  restitution = 0.3,
  friction = 0.5,
  fixed = false,
  name,
  resetTrigger = 0,
  timeScale = 1,
  isPaused = false,
  onUpdate
}: PhysicsBoxProps) {
  const rigidRef = useRef<RapierRigidBody>(null)
  const initialMount = useRef(true)
  const timeRef = useRef(0)

  // Use refs to always have access to latest values (avoids stale closure)
  const positionRef = useRef(position)
  const velocityRef = useRef(velocity)
  positionRef.current = position
  velocityRef.current = velocity

  // Set initial velocity on mount
  useEffect(() => {
    if (rigidRef.current && initialMount.current) {
      const v = velocityRef.current
      rigidRef.current.setLinvel({ x: v[0], y: v[1], z: v[2] }, true)
      initialMount.current = false
    }
  }, [])

  // Reset position and velocity when resetTrigger changes
  useEffect(() => {
    if (rigidRef.current && !initialMount.current) {
      const p = positionRef.current
      const v = velocityRef.current
      // Reset position
      rigidRef.current.setTranslation({ x: p[0], y: p[1], z: p[2] }, true)
      // Reset rotation
      rigidRef.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
      // Reset velocities
      rigidRef.current.setLinvel({ x: v[0], y: v[1], z: v[2] }, true)
      rigidRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
      // Wake up the body
      rigidRef.current.wakeUp()
      // Reset time
      timeRef.current = 0
    }
  }, [resetTrigger])

  useFrame((_, delta) => {
    // Track physics time (only when not paused)
    if (!isPaused) {
      timeRef.current += delta * timeScale
    }

    if (rigidRef.current && onUpdate) {
      const pos = rigidRef.current.translation()
      const vel = rigidRef.current.linvel()
      onUpdate({
        position: new THREE.Vector3(pos.x, pos.y, pos.z),
        velocity: new THREE.Vector3(vel.x, vel.y, vel.z),
        time: timeRef.current
      })
    }
  })

  return (
    <RigidBody
      ref={rigidRef}
      position={position}
      type={fixed ? 'fixed' : 'dynamic'}
      mass={mass}
      restitution={restitution}
      friction={friction}
      name={name}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}

// ============================================
// PHYSICS SPHERE
// ============================================
interface PhysicsSphereProps {
  position?: [number, number, number]
  radius?: number
  color?: string
  mass?: number
  velocity?: [number, number, number]
  restitution?: number
  friction?: number
  fixed?: boolean
  name?: string
  resetTrigger?: number
  timeScale?: number
  isPaused?: boolean
  onUpdate?: (data: { position: THREE.Vector3; velocity: THREE.Vector3; time: number }) => void
}

export function PhysicsSphere({
  position = [0, 2, 0],
  radius = 0.5,
  color = '#ff4040',
  mass = 1,
  velocity = [0, 0, 0],
  restitution = 0.5,
  friction = 0.3,
  fixed = false,
  name,
  resetTrigger = 0,
  timeScale = 1,
  isPaused = false,
  onUpdate
}: PhysicsSphereProps) {
  const rigidRef = useRef<RapierRigidBody>(null)
  const initialMount = useRef(true)
  const timeRef = useRef(0)

  // Use refs to always have access to latest values (avoids stale closure)
  const positionRef = useRef(position)
  const velocityRef = useRef(velocity)
  positionRef.current = position
  velocityRef.current = velocity

  // Set initial velocity on mount
  useEffect(() => {
    if (rigidRef.current && initialMount.current) {
      const v = velocityRef.current
      rigidRef.current.setLinvel({ x: v[0], y: v[1], z: v[2] }, true)
      initialMount.current = false
    }
  }, [])

  // Reset position and velocity when resetTrigger changes
  useEffect(() => {
    if (rigidRef.current && !initialMount.current) {
      const p = positionRef.current
      const v = velocityRef.current
      // Reset position
      rigidRef.current.setTranslation({ x: p[0], y: p[1], z: p[2] }, true)
      // Reset rotation
      rigidRef.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
      // Reset velocities
      rigidRef.current.setLinvel({ x: v[0], y: v[1], z: v[2] }, true)
      rigidRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
      // Wake up the body
      rigidRef.current.wakeUp()
    }
    // Reset time
    timeRef.current = 0
  }, [resetTrigger])

  useFrame((_, delta) => {
    // Track physics time (only when not paused)
    if (!isPaused) {
      timeRef.current += delta * timeScale
    }

    if (rigidRef.current && onUpdate) {
      const pos = rigidRef.current.translation()
      const vel = rigidRef.current.linvel()
      onUpdate({
        position: new THREE.Vector3(pos.x, pos.y, pos.z),
        velocity: new THREE.Vector3(vel.x, vel.y, vel.z),
        time: timeRef.current
      })
    }
  })

  return (
    <RigidBody
      ref={rigidRef}
      position={position}
      type={fixed ? 'fixed' : 'dynamic'}
      mass={mass}
      restitution={restitution}
      friction={friction}
      colliders="ball"
      name={name}
    >
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}

// ============================================
// GROUND PLANE
// ============================================
interface GroundProps {
  size?: [number, number]
  position?: [number, number, number]
  color?: string
}

export function Ground({
  size = [100, 100],
  position = [0, 0, 0],
  color = '#1a1a1a'
}: GroundProps) {
  return (
    <RigidBody type="fixed" position={position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}

// ============================================
// INCLINED PLANE / RAMP
// ============================================
interface RampProps {
  position?: [number, number, number]
  size?: [number, number, number]
  angle?: number // degrees
  color?: string
  friction?: number
  restitution?: number
}

export function Ramp({
  position = [0, 0, 0],
  size = [4, 0.2, 2],
  angle = 30,
  color = '#333',
  friction = 0.5,
  restitution = 0.1
}: RampProps) {
  const angleRad = (angle * Math.PI) / 180

  return (
    <RigidBody type="fixed" position={position} rotation={[0, 0, angleRad]} friction={friction} restitution={restitution}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}

// ============================================
// WALL
// ============================================
interface WallProps {
  position?: [number, number, number]
  size?: [number, number, number]
  color?: string
}

export function Wall({
  position = [0, 1, 0],
  size = [0.2, 2, 4],
  color = '#333'
}: WallProps) {
  return (
    <RigidBody type="fixed" position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}

// ============================================
// CLIFF
// ============================================
interface CliffProps {
  height?: number
  width?: number
  depth?: number
  position?: [number, number, number]
  color?: string
}

export function Cliff({
  height = 20,
  width = 4,
  depth = 6,
  position = [0, 0, 0],
  color = '#2a2a2a'
}: CliffProps) {
  // Cliff is positioned so the top is at position[1] + height
  // and extends to the left (negative X)
  const cliffX = position[0] - width / 2
  const cliffY = position[1] + height / 2
  const cliffZ = position[2]

  return (
    <RigidBody type="fixed" position={[cliffX, cliffY, cliffZ]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}

// ============================================
// SPRING (Visual + Physics)
// ============================================
interface SpringProps {
  anchor: [number, number, number]
  attachedBody: React.RefObject<RapierRigidBody>
  stiffness?: number
  damping?: number
  restLength?: number
}

export function Spring({
  anchor,
  attachedBody,
  stiffness = 50,
  damping = 1,
  restLength = 2
}: SpringProps) {
  const anchorRef = useRef<RapierRigidBody>(null)

  useSpringJoint(anchorRef as React.RefObject<RapierRigidBody>, attachedBody as React.RefObject<RapierRigidBody>, [
    [0, 0, 0],
    [0, 0, 0],
    restLength,
    stiffness,
    damping
  ])

  return (
    <RigidBody ref={anchorRef} type="fixed" position={anchor}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#666" />
      </mesh>
    </RigidBody>
  )
}

// ============================================
// PENDULUM
// ============================================
interface PendulumProps {
  pivot?: [number, number, number]
  length?: number
  bobRadius?: number
  bobMass?: number
  initialAngle?: number // degrees
  color?: string
  onUpdate?: (data: { angle: number; angularVelocity: number }) => void
}

export function Pendulum({
  pivot = [0, 5, 0],
  length = 3,
  bobRadius = 0.3,
  bobMass = 1,
  initialAngle = 45,
  color = '#ff8040',
  onUpdate: _onUpdate
}: PendulumProps) {
  void _onUpdate; // TODO: implement onUpdate callback
  const pivotRef = useRef<RapierRigidBody>(null)
  const bobRef = useRef<RapierRigidBody>(null)

  const angleRad = (initialAngle * Math.PI) / 180
  const bobX = pivot[0] + length * Math.sin(angleRad)
  const bobY = pivot[1] - length * Math.cos(angleRad)

  return (
    <>
      {/* Pivot point */}
      <RigidBody ref={pivotRef} type="fixed" position={pivot}>
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#666" />
        </mesh>
      </RigidBody>

      {/* Bob */}
      <RigidBody
        ref={bobRef}
        position={[bobX, bobY, pivot[2]]}
        mass={bobMass}
        linearDamping={0.1}
      >
        <BallCollider args={[bobRadius]} />
        <mesh castShadow>
          <sphereGeometry args={[bobRadius, 32, 32]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </RigidBody>

      {/* Rod visualization would go here */}
      {pivotRef.current && bobRef.current && (
        <PendulumRod pivotRef={pivotRef} bobRef={bobRef} />
      )}
    </>
  )
}

function PendulumRod({
  pivotRef,
  bobRef
}: {
  pivotRef: React.RefObject<RapierRigidBody | null>
  bobRef: React.RefObject<RapierRigidBody | null>
}) {
  const rodRef = useRef<THREE.Line>(null)

  useFrame(() => {
    if (rodRef.current && pivotRef.current && bobRef.current) {
      const pivotPos = pivotRef.current.translation()
      const bobPos = bobRef.current.translation()
      const positions = rodRef.current.geometry.attributes.position
      positions.setXYZ(0, pivotPos.x, pivotPos.y, pivotPos.z)
      positions.setXYZ(1, bobPos.x, bobPos.y, bobPos.z)
      positions.needsUpdate = true
    }
  })

  return (
    <line ref={rodRef as any}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array([0, 0, 0, 0, 0, 0]), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#888" />
    </line>
  )
}

// ============================================
// PROJECTILE
// ============================================
interface ProjectileProps {
  position?: [number, number, number]
  velocity?: [number, number, number]
  radius?: number
  mass?: number
  color?: string
  showTrajectory?: boolean
  onUpdate?: (data: { position: THREE.Vector3; velocity: THREE.Vector3; time: number }) => void
}

export function Projectile({
  position = [0, 1, 0],
  velocity = [5, 10, 0],
  radius = 0.2,
  mass = 1,
  color = '#40ff40',
  showTrajectory = true,
  onUpdate
}: ProjectileProps) {
  const rigidRef = useRef<RapierRigidBody>(null)
  const trajectoryRef = useRef<THREE.Vector3[]>([])
  const startTime = useRef(Date.now())
  const velocitySet = useRef(false)

  // Only set initial velocity once on mount
  useEffect(() => {
    if (rigidRef.current && !velocitySet.current) {
      rigidRef.current.setLinvel({ x: velocity[0], y: velocity[1], z: velocity[2] }, true)
      trajectoryRef.current = []
      startTime.current = Date.now()
      velocitySet.current = true
    }
  }, []) // Empty dependency - only run on mount

  useFrame(() => {
    if (rigidRef.current) {
      const pos = rigidRef.current.translation()
      const vel = rigidRef.current.linvel()
      const time = (Date.now() - startTime.current) / 1000

      // Update trajectory
      if (showTrajectory && trajectoryRef.current.length < 500) {
        trajectoryRef.current.push(new THREE.Vector3(pos.x, pos.y, pos.z))
      }

      if (onUpdate) {
        onUpdate({
          position: new THREE.Vector3(pos.x, pos.y, pos.z),
          velocity: new THREE.Vector3(vel.x, vel.y, vel.z),
          time
        })
      }
    }
  })

  return (
    <>
      <RigidBody
        ref={rigidRef}
        position={position}
        mass={mass}
        restitution={0.3}
        colliders="ball"
      >
        <mesh castShadow>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      </RigidBody>

      {/* Trajectory line would be rendered here */}
    </>
  )
}

// ============================================
// FORCE ARROW (Visual)
// ============================================
interface ForceArrowProps {
  position: [number, number, number]
  direction: [number, number, number]
  magnitude?: number
  color?: string
  label?: string
}

export function ForceArrow({
  position,
  direction,
  magnitude = 1,
  color = '#ffff00',
  label: _label
}: ForceArrowProps) {
  void _label; // TODO: implement label rendering
  const dir = new THREE.Vector3(...direction).normalize()
  const length = magnitude * 0.5

  return (
    <group position={position}>
      <arrowHelper
        args={[
          dir,
          new THREE.Vector3(0, 0, 0),
          length,
          color,
          length * 0.2,
          length * 0.1
        ]}
      />
    </group>
  )
}

// ============================================
// TORQUE DEMO (Door/Rod)
// ============================================
interface TorqueDemoProps {
  objectType?: 'door' | 'rod'
  length: number                    // m
  mass: number                      // kg
  forcePosition: number             // m from pivot
  forceMagnitude: number            // N
  forceAngle?: number               // degrees from perpendicular
  resetTrigger?: number
  timeScale?: number
  isPaused?: boolean
  onUpdate?: (data: {
    angle: number
    angularVelocity: number
    angularAcceleration: number
    torque: number
    time: number
  }) => void
}

export function TorqueDemo({
  objectType = 'door',
  length,
  mass,
  forcePosition,
  forceMagnitude,
  forceAngle = 0,
  resetTrigger = 0,
  timeScale = 1,
  isPaused = false,
  onUpdate
}: TorqueDemoProps) {
  const timeRef = useRef(0)
  const angleRef = useRef(0)
  const angularVelocityRef = useRef(0)
  const doorRef = useRef<THREE.Group>(null)

  // Moment of inertia for rod/door about end: I = (1/3)ML²
  const momentOfInertia = (1 / 3) * mass * length * length

  // Torque: τ = r × F = rF·sin(90° - forceAngle) = rF·cos(forceAngle)
  const forceAngleRad = (forceAngle * Math.PI) / 180
  const torque = forcePosition * forceMagnitude * Math.cos(forceAngleRad)

  // Angular acceleration: α = τ/I
  const angularAcceleration = torque / momentOfInertia

  // Reset when resetTrigger changes
  useEffect(() => {
    timeRef.current = 0
    angleRef.current = 0
    angularVelocityRef.current = 0
  }, [resetTrigger])

  useFrame((_, delta) => {
    if (isPaused) return

    const dt = delta * timeScale
    timeRef.current += dt

    // Update angular motion
    angularVelocityRef.current += angularAcceleration * dt
    angleRef.current += angularVelocityRef.current * dt

    // Limit rotation (door can't go through wall)
    if (angleRef.current > Math.PI / 2) {
      angleRef.current = Math.PI / 2
      angularVelocityRef.current = 0
    }

    // Update door rotation
    if (doorRef.current) {
      doorRef.current.rotation.y = angleRef.current
    }

    if (onUpdate) {
      onUpdate({
        angle: angleRef.current * (180 / Math.PI),
        angularVelocity: angularVelocityRef.current,
        angularAcceleration,
        torque,
        time: timeRef.current
      })
    }
  })

  return (
    <group>
      {/* Hinge/pivot point */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 3, 16]} />
        <meshStandardMaterial color="#444444" metalness={0.6} />
      </mesh>

      {/* Door/rod that rotates */}
      <group ref={doorRef} position={[0, 1.5, 0]}>
        {objectType === 'door' ? (
          <>
            {/* Door panel */}
            <mesh position={[length / 2, 0, 0]} castShadow>
              <boxGeometry args={[length, 2.5, 0.1]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Door handle */}
            <mesh position={[length - 0.3, 0, 0.1]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
            </mesh>
          </>
        ) : (
          /* Rod */
          <mesh position={[length / 2, 0, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, length, 8]} />
            <meshStandardMaterial color="#666666" metalness={0.5} />
          </mesh>
        )}

        {/* Force application point marker */}
        <mesh position={[forcePosition, 0, 0.15]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.5} />
        </mesh>

        {/* Force arrow */}
        <group position={[forcePosition, 0, 0.3]} rotation={[0, -forceAngleRad, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, forceMagnitude / 30, 8]} />
            <meshStandardMaterial color="#4488ff" emissive="#4488ff" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0, 0, forceMagnitude / 60]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.08, 0.2, 8]} />
            <meshStandardMaterial color="#4488ff" emissive="#4488ff" emissiveIntensity={0.3} />
          </mesh>
        </group>

        {/* Lever arm indicator */}
        <mesh position={[forcePosition / 2, -1.5, 0]}>
          <boxGeometry args={[forcePosition, 0.02, 0.02]} />
          <meshStandardMaterial color="#ffff00" />
        </mesh>
      </group>

      {/* Wall/frame */}
      <mesh position={[-0.15, 1.5, 0]} castShadow>
        <boxGeometry args={[0.3, 3.5, 0.5]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  )
}

// ============================================
// SEESAW (Lever Equilibrium)
// ============================================
interface SeesawProps {
  beamLength?: number               // m
  beamMass?: number                 // kg (usually negligible)
  leftMass: number                  // kg
  leftDistance: number              // m from pivot
  rightMass: number                 // kg
  rightDistance: number             // m from pivot
  gravity?: number                  // m/s² (default 9.81)
  resetTrigger?: number
  timeScale?: number
  isPaused?: boolean
  onUpdate?: (data: {
    angle: number
    leftTorque: number
    rightTorque: number
    netTorque: number
    isBalanced: boolean
  }) => void
}

export function Seesaw({
  beamLength = 6,
  beamMass = 0,
  leftMass,
  leftDistance,
  rightMass,
  rightDistance,
  gravity = 9.81,
  resetTrigger = 0,
  timeScale = 1,
  isPaused = false,
  onUpdate
}: SeesawProps) {
  const timeRef = useRef(0)
  const angleRef = useRef(0)
  const angularVelocityRef = useRef(0)
  const beamRef = useRef<THREE.Group>(null)

  const g = gravity
  const leftTorque = leftMass * g * leftDistance
  const rightTorque = rightMass * g * rightDistance
  const netTorque = rightTorque - leftTorque
  const isBalanced = Math.abs(netTorque) < 0.1

  // Moment of inertia: I = (1/12)ML² + m1*d1² + m2*d2²
  const beamI = (1 / 12) * beamMass * beamLength * beamLength
  const totalI = beamI + leftMass * leftDistance * leftDistance + rightMass * rightDistance * rightDistance
  // Initial angular acceleration (theoretical) - actual acceleration computed in animation loop
  void (totalI > 0 ? netTorque / totalI : 0)

  // Reset when resetTrigger changes
  useEffect(() => {
    timeRef.current = 0
    angleRef.current = 0
    angularVelocityRef.current = 0
  }, [resetTrigger])

  useFrame((_, delta) => {
    if (isPaused) return

    const dt = delta * timeScale
    timeRef.current += dt

    if (!isBalanced) {
      // Apply angular motion with gravity restoring torque
      const currentNetTorque = netTorque * Math.cos(angleRef.current)
      const currentAccel = totalI > 0 ? currentNetTorque / totalI : 0
      angularVelocityRef.current += currentAccel * dt
      // Add damping
      angularVelocityRef.current *= 0.995
      angleRef.current += angularVelocityRef.current * dt

      // Limit angle
      const maxAngle = Math.PI / 6 // 30 degrees
      if (angleRef.current > maxAngle) {
        angleRef.current = maxAngle
        angularVelocityRef.current = -angularVelocityRef.current * 0.5
      }
      if (angleRef.current < -maxAngle) {
        angleRef.current = -maxAngle
        angularVelocityRef.current = -angularVelocityRef.current * 0.5
      }
    }

    // Update beam rotation
    if (beamRef.current) {
      beamRef.current.rotation.z = angleRef.current
    }

    if (onUpdate) {
      onUpdate({
        angle: angleRef.current * (180 / Math.PI),
        leftTorque,
        rightTorque,
        netTorque,
        isBalanced
      })
    }
  })

  return (
    <group>
      {/* Fulcrum/pivot (triangle) */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.5, 1, 3]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* Beam that rotates */}
      <group ref={beamRef} position={[0, 1.2, 0]}>
        {/* Main beam */}
        <mesh castShadow>
          <boxGeometry args={[beamLength, 0.15, 0.4]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Left mass */}
        <group position={[-leftDistance, 0.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#4080ff" />
          </mesh>
          {/* Left weight arrow */}
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.03, 0.03, leftMass * g / 50, 8]} />
            <meshStandardMaterial color="#ff8800" />
          </mesh>
        </group>

        {/* Right mass */}
        <group position={[rightDistance, 0.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#ff8040" />
          </mesh>
          {/* Right weight arrow */}
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.03, 0.03, rightMass * g / 50, 8]} />
            <meshStandardMaterial color="#ff8800" />
          </mesh>
        </group>

        {/* Distance markers */}
        <mesh position={[-leftDistance / 2, -0.2, 0]}>
          <boxGeometry args={[leftDistance, 0.02, 0.02]} />
          <meshStandardMaterial color="#44ff44" />
        </mesh>
        <mesh position={[rightDistance / 2, -0.2, 0]}>
          <boxGeometry args={[rightDistance, 0.02, 0.02]} />
          <meshStandardMaterial color="#44ff44" />
        </mesh>
      </group>

      {/* Balance indicator */}
      {isBalanced && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}

// ============================================
// ENERGY BARS (Reusable visualization)
// ============================================
interface EnergyBarsProps {
  kineticEnergy: number
  potentialEnergy: number
  springEnergy?: number
  dissipatedEnergy?: number
  totalEnergy: number
  position?: [number, number, number]
  scale?: number
}

export function EnergyBars({
  kineticEnergy,
  potentialEnergy,
  springEnergy = 0,
  dissipatedEnergy = 0,
  totalEnergy,
  position = [5, 3, 0],
  scale = 0.1
}: EnergyBarsProps) {
  const barWidth = 0.3
  const maxHeight = totalEnergy * scale
  const spacing = 0.5

  return (
    <group position={position}>
      {/* KE bar (red) */}
      <mesh position={[0, kineticEnergy * scale / 2, 0]}>
        <boxGeometry args={[barWidth, Math.max(0.01, kineticEnergy * scale), barWidth]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.2} />
      </mesh>

      {/* PE bar (blue) */}
      <mesh position={[spacing, potentialEnergy * scale / 2, 0]}>
        <boxGeometry args={[barWidth, Math.max(0.01, potentialEnergy * scale), barWidth]} />
        <meshStandardMaterial color="#4444ff" emissive="#4444ff" emissiveIntensity={0.2} />
      </mesh>

      {/* Spring PE bar (green) */}
      {springEnergy > 0 && (
        <mesh position={[spacing * 2, springEnergy * scale / 2, 0]}>
          <boxGeometry args={[barWidth, springEnergy * scale, barWidth]} />
          <meshStandardMaterial color="#44ff44" emissive="#44ff44" emissiveIntensity={0.2} />
        </mesh>
      )}

      {/* Dissipated energy bar (gray) */}
      {dissipatedEnergy > 0 && (
        <mesh position={[spacing * 3, dissipatedEnergy * scale / 2, 0]}>
          <boxGeometry args={[barWidth, dissipatedEnergy * scale, barWidth]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      )}

      {/* Total energy reference line */}
      <mesh position={[(spacing * 3) / 2, maxHeight, 0]}>
        <boxGeometry args={[spacing * 4 + barWidth, 0.02, 0.02]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>

      {/* Labels (using small spheres as markers) */}
      <mesh position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ff4444" />
      </mesh>
      <mesh position={[spacing, -0.3, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#4444ff" />
      </mesh>
    </group>
  )
}

// ============================================
// ENHANCED COLLISION (with Impulse)
// ============================================
interface EnhancedCollisionProps {
  mass1: number                     // kg
  velocity1: number                 // m/s (initial)
  mass2: number                     // kg
  velocity2?: number                // m/s (initial, often 0)
  collisionType?: 'elastic' | 'inelastic'
  collisionDuration?: number        // s (for impulse calc)
  resetTrigger?: number
  timeScale?: number
  isPaused?: boolean
  onUpdate?: (data: {
    position1: THREE.Vector3
    position2: THREE.Vector3
    velocity1: number
    velocity2: number
    phase: 'before' | 'during' | 'after'
    impulse: number
    averageForce: number
    kineticEnergyBefore: number
    kineticEnergyAfter: number
    momentumBefore: number
    momentumAfter: number
    time: number
  }) => void
}

export function EnhancedCollision({
  mass1,
  velocity1,
  mass2,
  velocity2 = 0,
  collisionType = 'elastic',
  collisionDuration = 0.1,
  resetTrigger = 0,
  timeScale = 1,
  isPaused = false,
  onUpdate
}: EnhancedCollisionProps) {
  const timeRef = useRef(0)
  const pos1Ref = useRef(-4)
  const pos2Ref = useRef(2)
  const vel1Ref = useRef(velocity1)
  const vel2Ref = useRef(velocity2)
  const phaseRef = useRef<'before' | 'during' | 'after'>('before')
  const collisionTimeRef = useRef(0)

  const obj1Ref = useRef<THREE.Mesh>(null)
  const obj2Ref = useRef<THREE.Mesh>(null)

  // Calculate final velocities
  let v1Final: number, v2Final: number
  if (collisionType === 'elastic') {
    v1Final = ((mass1 - mass2) * velocity1 + 2 * mass2 * velocity2) / (mass1 + mass2)
    v2Final = ((mass2 - mass1) * velocity2 + 2 * mass1 * velocity1) / (mass1 + mass2)
  } else {
    // Perfectly inelastic - objects stick together
    v1Final = v2Final = (mass1 * velocity1 + mass2 * velocity2) / (mass1 + mass2)
  }

  // Impulse and force calculations
  const impulse = mass1 * (v1Final - velocity1)
  const averageForce = impulse / collisionDuration

  // Energy calculations
  const keBefore = 0.5 * mass1 * velocity1 * velocity1 + 0.5 * mass2 * velocity2 * velocity2
  const keAfter = 0.5 * mass1 * v1Final * v1Final + 0.5 * mass2 * v2Final * v2Final
  const momentumBefore = mass1 * velocity1 + mass2 * velocity2
  const momentumAfter = mass1 * v1Final + mass2 * v2Final

  // Sizes based on mass
  const size1 = 0.3 + mass1 * 0.1
  const size2 = 0.3 + mass2 * 0.1

  // Reset when resetTrigger changes
  useEffect(() => {
    timeRef.current = 0
    pos1Ref.current = -4
    pos2Ref.current = 2
    vel1Ref.current = velocity1
    vel2Ref.current = velocity2
    phaseRef.current = 'before'
    collisionTimeRef.current = 0
  }, [resetTrigger, velocity1, velocity2])

  useFrame((_, delta) => {
    if (isPaused) return

    const dt = delta * timeScale
    timeRef.current += dt

    // Check for collision
    const gap = pos2Ref.current - pos1Ref.current - size1 - size2
    const approaching = vel1Ref.current > vel2Ref.current

    if (phaseRef.current === 'before' && gap <= 0 && approaching) {
      phaseRef.current = 'during'
      collisionTimeRef.current = 0
    }

    if (phaseRef.current === 'during') {
      collisionTimeRef.current += dt
      if (collisionTimeRef.current >= collisionDuration) {
        phaseRef.current = 'after'
        vel1Ref.current = v1Final
        vel2Ref.current = v2Final
      }
    }

    // Update positions
    if (phaseRef.current !== 'during') {
      pos1Ref.current += vel1Ref.current * dt
      pos2Ref.current += vel2Ref.current * dt
    }

    // Update mesh positions
    if (obj1Ref.current) {
      obj1Ref.current.position.x = pos1Ref.current
    }
    if (obj2Ref.current) {
      obj2Ref.current.position.x = pos2Ref.current
    }

    if (onUpdate) {
      onUpdate({
        position1: new THREE.Vector3(pos1Ref.current, size1, 0),
        position2: new THREE.Vector3(pos2Ref.current, size2, 0),
        velocity1: vel1Ref.current,
        velocity2: vel2Ref.current,
        phase: phaseRef.current,
        impulse: Math.abs(impulse),
        averageForce: Math.abs(averageForce),
        kineticEnergyBefore: keBefore,
        kineticEnergyAfter: keAfter,
        momentumBefore,
        momentumAfter,
        time: timeRef.current
      })
    }
  })

  return (
    <group>
      {/* Ground */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Object 1 */}
      <mesh ref={obj1Ref} position={[-4, size1, 0]} castShadow>
        <boxGeometry args={[size1 * 2, size1 * 2, size1 * 2]} />
        <meshStandardMaterial color="#4080ff" />
      </mesh>

      {/* Object 2 */}
      <mesh ref={obj2Ref} position={[2, size2, 0]} castShadow>
        <boxGeometry args={[size2 * 2, size2 * 2, size2 * 2]} />
        <meshStandardMaterial color="#ff8040" />
      </mesh>

      {/* Velocity arrows (before collision) */}
      {phaseRef.current === 'before' && (
        <>
          {/* Object 1 velocity arrow */}
          <group position={[pos1Ref.current + size1 + 0.3, size1, 0]}>
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, velocity1 / 3, 8]} />
              <meshStandardMaterial color="#44ff44" />
            </mesh>
          </group>
        </>
      )}

      {/* Impulse indicator during collision */}
      {phaseRef.current === 'during' && (
        <mesh position={[(pos1Ref.current + pos2Ref.current) / 2, 2, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  )
}

// ============================================
// BANKED CURVE TRACK
// ============================================
interface BankedCurveProps {
  radius?: number
  bankAngle?: number // degrees
  trackWidth?: number
  segments?: number
  color?: string
  arcAngle?: number // degrees - how much of the circle to show (360 = full)
}

export function BankedCurve({
  radius = 50,
  bankAngle = 20,
  trackWidth = 10,
  segments = 1024, // Maximum smoothness - like Riemann sums with n→∞
  color = '#333',
  arcAngle = 360
}: BankedCurveProps) {
  const bankRad = (bankAngle * Math.PI) / 180

  // Create track segments around the circle
  // More rectangles = smoother curve (Riemann sum principle: ∫f(x)dx ≈ Σf(xᵢ)Δx)
  // With 1024 segments, each rectangle spans only ~0.35° of arc
  const trackSegments = []
  const actualSegments = Math.floor(segments * (arcAngle / 360))

  for (let i = 0; i < actualSegments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const nextAngle = ((i + 1) / segments) * Math.PI * 2
    const midAngle = (angle + nextAngle) / 2

    // Position at the middle of the track radius
    const x = Math.cos(midAngle) * radius
    const z = Math.sin(midAngle) * radius

    // Each segment is a thin rectangle - thinner = smoother curve
    const segmentLength = (2 * Math.PI * radius) / segments
    const rotationY = -midAngle + Math.PI / 2

    // Calculate Y position based on bank angle
    const yPos = 1 + (trackWidth / 2) * Math.sin(bankRad)

    trackSegments.push(
      <RigidBody
        key={i}
        type="fixed"
        position={[x, yPos, z]}
        rotation={[bankRad, rotationY, 0]}
        friction={0}
        restitution={0.1}
      >
        <mesh receiveShadow castShadow>
          {/* Slight overlap (1.02) ensures seamless connection */}
          <boxGeometry args={[segmentLength * 1.02, 0.5, trackWidth]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </RigidBody>
    )
  }

  // Add inner and outer barriers with racing stripes
  // Use fewer segments for barriers to show distinct stripes
  const barrierSegments = Math.floor(actualSegments / 4)
  const barriers = []
  for (let i = 0; i < barrierSegments; i++) {
    const angle = (i / barrierSegments) * (arcAngle * Math.PI / 180)
    const nextAngle = ((i + 1) / barrierSegments) * (arcAngle * Math.PI / 180)
    const midAngle = (angle + nextAngle) / 2
    const segmentLength = (2 * Math.PI * radius * arcAngle / 360) / barrierSegments

    // Inner barrier (red/white racing stripes)
    const innerR = radius - trackWidth / 2 + 0.3
    const innerY = 1.5 + (trackWidth / 2 - 2) * Math.sin(bankRad)
    barriers.push(
      <mesh
        key={`inner-${i}`}
        position={[
          Math.cos(midAngle) * innerR,
          innerY,
          Math.sin(midAngle) * innerR
        ]}
        rotation={[0, -midAngle + Math.PI / 2, 0]}
        castShadow
      >
        <boxGeometry args={[segmentLength * 1.02, 1.5, 0.4]} />
        <meshStandardMaterial color={i % 2 === 0 ? '#ff2222' : '#ffffff'} />
      </mesh>
    )

    // Outer barrier (blue/white like racing barriers)
    const outerR = radius + trackWidth / 2 - 0.3
    const outerY = 2 + (trackWidth / 2) * Math.sin(bankRad)
    barriers.push(
      <mesh
        key={`outer-${i}`}
        position={[
          Math.cos(midAngle) * outerR,
          outerY,
          Math.sin(midAngle) * outerR
        ]}
        rotation={[0, -midAngle + Math.PI / 2, 0]}
        castShadow
      >
        <boxGeometry args={[segmentLength * 1.02, 2, 0.4]} />
        <meshStandardMaterial color={i % 2 === 0 ? '#2266ff' : '#ffffff'} />
      </mesh>
    )
  }

  // Add track markings (dashed center line)
  // Create evenly spaced dashes around the track
  const dashCount = 32 // Number of dashes
  const markings = []
  for (let i = 0; i < dashCount; i++) {
    // Only draw every other segment to create dashed effect
    if (i % 2 === 0) {
      const startAngle = (i / dashCount) * (arcAngle * Math.PI / 180)
      const endAngle = ((i + 0.8) / dashCount) * (arcAngle * Math.PI / 180)
      const midAngle = (startAngle + endAngle) / 2
      const dashLength = (2 * Math.PI * radius * arcAngle / 360) / dashCount * 0.8

      const markR = radius // Center of track
      const yPos = 1.27 + (trackWidth / 2) * Math.sin(bankRad) // Just above track surface

      markings.push(
        <mesh
          key={`mark-${i}`}
          position={[
            Math.cos(midAngle) * markR,
            yPos,
            Math.sin(midAngle) * markR
          ]}
          rotation={[bankRad, -midAngle + Math.PI / 2, 0]}
        >
          <boxGeometry args={[dashLength, 0.02, 0.25]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
        </mesh>
      )
    }
  }

  // Add edge lines (solid white lines on edges of track)
  const edgeLineSegments = 128
  const edgeLines = []
  for (let i = 0; i < edgeLineSegments; i++) {
    const angle = (i / edgeLineSegments) * (arcAngle * Math.PI / 180)
    const nextAngle = ((i + 1) / edgeLineSegments) * (arcAngle * Math.PI / 180)
    const midAngle = (angle + nextAngle) / 2
    const segLen = (2 * Math.PI * radius * arcAngle / 360) / edgeLineSegments

    // Inner edge line
    const innerLineR = radius - trackWidth / 2 + 1
    const innerY = 1.27 + (trackWidth / 2 - 1) * Math.sin(bankRad)
    edgeLines.push(
      <mesh
        key={`inner-line-${i}`}
        position={[
          Math.cos(midAngle) * innerLineR,
          innerY,
          Math.sin(midAngle) * innerLineR
        ]}
        rotation={[bankRad, -midAngle + Math.PI / 2, 0]}
      >
        <boxGeometry args={[segLen * 1.05, 0.02, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    )

    // Outer edge line
    const outerLineR = radius + trackWidth / 2 - 1
    const outerY = 1.27 + (trackWidth / 2 + 1) * Math.sin(bankRad)
    edgeLines.push(
      <mesh
        key={`outer-line-${i}`}
        position={[
          Math.cos(midAngle) * outerLineR,
          outerY,
          Math.sin(midAngle) * outerLineR
        ]}
        rotation={[bankRad, -midAngle + Math.PI / 2, 0]}
      >
        <boxGeometry args={[segLen * 1.05, 0.02, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    )
  }

  return (
    <group>
      {trackSegments}
      {barriers}
      {markings}
      {edgeLines}
    </group>
  )
}

// ============================================
// STRAIGHT ROAD (for linear motion)
// ============================================
interface StraightRoadProps {
  length?: number
  width?: number
  position?: [number, number, number]
}

export function StraightRoad({
  length = 100,
  width = 10,
  position = [0, 0, 0]
}: StraightRoadProps) {
  const roadSegments = 50
  const segmentLength = length / roadSegments

  return (
    <group position={position}>
      {/* Road surface */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[length / 2, 0.01, 0]}>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Center dashed line */}
      {Array.from({ length: Math.floor(roadSegments / 2) }).map((_, i) => (
        <mesh
          key={`dash-${i}`}
          position={[i * segmentLength * 2 + segmentLength, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[segmentLength * 0.8, 0.2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Edge lines */}
      <mesh position={[length / 2, 0.02, width / 2 - 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[length / 2, 0.02, -width / 2 + 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Distance markers every 10m */}
      {Array.from({ length: Math.floor(length / 10) + 1 }).map((_, i) => (
        <group key={`marker-${i}`} position={[i * 10, 0, width / 2 + 1]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.2, 1, 0.2]} />
            <meshStandardMaterial color="#ff6600" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ============================================
// LINEAR CAR (for acceleration/kinematics)
// ============================================
interface LinearCarProps {
  initialVelocity?: number
  acceleration?: number
  maxTime?: number
  color?: string
  resetTrigger?: number
  timeScale?: number
  isPaused?: boolean
  onUpdate?: (data: { position: THREE.Vector3; velocity: THREE.Vector3; time: number; distance: number }) => void
}

export function LinearCar({
  initialVelocity = 0,
  acceleration = 2.5,
  maxTime = 8,
  color = '#2266cc',
  resetTrigger = 0,
  timeScale = 1,
  isPaused = false,
  onUpdate
}: LinearCarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)
  const wheelRefs = [
    useRef<THREE.Group>(null),
    useRef<THREE.Group>(null),
    useRef<THREE.Group>(null),
    useRef<THREE.Group>(null)
  ]

  // Reset when resetTrigger changes
  useEffect(() => {
    timeRef.current = 0
    if (groupRef.current) {
      groupRef.current.position.set(0, 0.5, 0)
    }
  }, [resetTrigger])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Don't update if paused
    if (isPaused) {
      // Still report current state when paused
      const t = Math.min(timeRef.current, maxTime)
      const distance = initialVelocity * t + 0.5 * acceleration * t * t
      const velocity = initialVelocity + acceleration * t
      if (onUpdate) {
        onUpdate({
          position: new THREE.Vector3(distance, 0.5, 0),
          velocity: new THREE.Vector3(velocity, 0, 0),
          time: t,
          distance: distance
        })
      }
      return
    }

    // Scale delta by timeScale for slow-mo effect
    const scaledDelta = delta * timeScale

    // Only update if within time limit
    if (timeRef.current < maxTime) {
      timeRef.current += scaledDelta

      // Kinematics: x = v₀t + ½at²
      const t = Math.min(timeRef.current, maxTime)
      const distance = initialVelocity * t + 0.5 * acceleration * t * t

      // Current velocity: v = v₀ + at
      const velocity = initialVelocity + acceleration * t

      // Update position (car moves along X axis)
      groupRef.current.position.x = distance
      groupRef.current.position.y = 0.5

      // Rotate wheels based on distance traveled (wheels spin around Z axis as car moves along X)
      const wheelRadius = 0.4
      const wheelRotation = distance / wheelRadius
      wheelRefs.forEach(ref => {
        if (ref.current) {
          ref.current.rotation.z = -wheelRotation // Negative for correct forward roll direction
        }
      })

      if (onUpdate) {
        onUpdate({
          position: new THREE.Vector3(distance, 0.5, 0),
          velocity: new THREE.Vector3(velocity, 0, 0),
          time: t,
          distance: distance
        })
      }
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* Car body - main chassis */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[4, 0.6, 1.8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Car body - cabin */}
      <mesh castShadow position={[-0.3, 0.85, 0]}>
        <boxGeometry args={[2, 0.55, 1.6]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Hood */}
      <mesh castShadow position={[1.3, 0.5, 0]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[1.2, 0.15, 1.6]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0.65, 0.75, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.6, 0.5, 1.4]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.6} />
      </mesh>

      {/* Rear window */}
      <mesh position={[-1.25, 0.75, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.5, 0.45, 1.4]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.6} />
      </mesh>

      {/* Headlights */}
      <mesh position={[1.95, 0.35, 0.55]}>
        <boxGeometry args={[0.1, 0.2, 0.4]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff00" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[1.95, 0.35, -0.55]}>
        <boxGeometry args={[0.1, 0.2, 0.4]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff00" emissiveIntensity={0.8} />
      </mesh>

      {/* Taillights */}
      <mesh position={[-1.95, 0.4, 0.6]}>
        <boxGeometry args={[0.1, 0.15, 0.35]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-1.95, 0.4, -0.6]}>
        <boxGeometry args={[0.1, 0.15, 0.35]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>

      {/* Grille */}
      <mesh position={[1.95, 0.25, 0]}>
        <boxGeometry args={[0.05, 0.25, 1]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Wheels */}
      {[
        [1.2, 0, 0.95],
        [1.2, 0, -0.95],
        [-1.2, 0, 0.95],
        [-1.2, 0, -0.95]
      ].map((pos, i) => {
        const isRightSide = pos[2] > 0
        return (
          <group key={i} position={pos as [number, number, number]}>
            <group ref={wheelRefs[i]}>
              {/* Tire - outer rubber */}
              <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.28, 32]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
              </mesh>
              {/* Tire - inner rim */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.28, 0.28, 0.3, 32]} />
                <meshStandardMaterial color="#333333" metalness={0.3} roughness={0.7} />
              </mesh>
              {/* Wheel rim/hubcap */}
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, isRightSide ? 0.14 : -0.14]}>
                <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
                <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Center cap */}
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, isRightSide ? 0.16 : -0.16]}>
                <cylinderGeometry args={[0.08, 0.08, 0.02, 12]} />
                <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          </group>
        )
      })}
    </group>
  )
}

// ============================================
// CAR (for circular motion)
// ============================================
interface CarProps {
  radius?: number // radius of circular path
  speed?: number // tangential speed (already scaled by timeScale in parent)
  bankAngle?: number
  color?: string
  resetTrigger?: number
  timeScale?: number // for tracking physics time
  isPaused?: boolean
  onUpdate?: (data: { position: THREE.Vector3; velocity: THREE.Vector3; speed: number; time: number }) => void
}

// Animated wheel component for circular motion car
function AnimatedWheel({ position, wheelRef, isRight }: {
  position: [number, number, number]
  wheelRef: React.RefObject<THREE.Group | null>
  isRight: boolean
}) {
  return (
    <group position={position}>
      <group ref={wheelRef}>
        {/* Tire - outer rubber */}
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.28, 32]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
        {/* Tire - inner rim */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.3, 32]} />
          <meshStandardMaterial color="#333333" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Wheel rim */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, isRight ? 0.14 : -0.14]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Center cap */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, isRight ? 0.16 : -0.16]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 12]} />
          <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  )
}

// ============================================
// MASS-SPRING SYSTEM (SHM)
// ============================================
interface MassSpringSystemProps {
  mass: number                    // kg
  springConstant: number          // N/m (k)
  dampingCoefficient?: number     // damping factor
  amplitude: number               // m (initial compression/displacement)
  orientation?: 'horizontal' | 'vertical'
  resetTrigger?: number
  timeScale?: number
  isPaused?: boolean
  onUpdate?: (data: {
    position: THREE.Vector3
    velocity: THREE.Vector3
    time: number
    period: number
    frequency: number
    springForce: number
    potentialEnergy: number
    kineticEnergy: number
  }) => void
}

export function MassSpringSystem({
  mass,
  springConstant,
  dampingCoefficient = 0,
  amplitude,
  orientation = 'horizontal',
  resetTrigger = 0,
  timeScale = 1,
  isPaused = false,
  onUpdate
}: MassSpringSystemProps) {
  const timeRef = useRef(0)
  const groupRef = useRef<THREE.Group>(null)
  const displacementRef = useRef(-amplitude) // Start compressed
  const velocityValRef = useRef(0)
  const peRef = useRef(0.5 * springConstant * amplitude * amplitude)
  const keRef = useRef(0)

  // Physics calculations
  const omega = Math.sqrt(springConstant / mass) // Angular frequency
  const period = (2 * Math.PI) / omega
  const frequency = 1 / period
  const maxPE = 0.5 * springConstant * amplitude * amplitude
  const maxForce = springConstant * amplitude

  // Reset time when resetTrigger changes
  useEffect(() => {
    timeRef.current = 0
    displacementRef.current = -amplitude
    velocityValRef.current = 0
    peRef.current = maxPE
    keRef.current = 0
  }, [resetTrigger, amplitude, maxPE])

  useFrame((_, delta) => {
    if (isPaused) return

    timeRef.current += delta * timeScale

    // SHM starting from COMPRESSED position: x(t) = -A * cos(ωt)
    // At t=0: x = -A (compressed), v = 0
    // At t=T/4: x = 0 (equilibrium), v = max
    // At t=T/2: x = +A (extended), v = 0
    const dampingFactor = dampingCoefficient > 0
      ? Math.exp(-dampingCoefficient * timeRef.current / (2 * mass))
      : 1

    // Start compressed (negative), release toward positive
    const displacement = -amplitude * dampingFactor * Math.cos(omega * timeRef.current)
    const velocity = amplitude * omega * dampingFactor * Math.sin(omega * timeRef.current)
    const springForce = -springConstant * displacement

    // Energy calculations
    const potentialEnergy = 0.5 * springConstant * displacement * displacement
    const kineticEnergy = 0.5 * mass * velocity * velocity

    displacementRef.current = displacement
    velocityValRef.current = velocity
    peRef.current = potentialEnergy
    keRef.current = kineticEnergy

    // Calculate position based on orientation
    let position: THREE.Vector3
    let velocityVec: THREE.Vector3

    if (orientation === 'horizontal') {
      position = new THREE.Vector3(displacement, 0, 0)
      velocityVec = new THREE.Vector3(velocity, 0, 0)
    } else {
      position = new THREE.Vector3(0, displacement, 0)
      velocityVec = new THREE.Vector3(0, velocity, 0)
    }

    if (onUpdate) {
      onUpdate({
        position,
        velocity: velocityVec,
        time: timeRef.current,
        period,
        frequency,
        springForce,
        potentialEnergy,
        kineticEnergy
      })
    }
  })

  // Animated spring visualization
  const SpringVisual = () => {
    const springGroupRef = useRef<THREE.Group>(null)
    const massRef = useRef<THREE.Group>(null)
    const forceArrowRef = useRef<THREE.Group>(null)
    const peBarRef = useRef<THREE.Mesh>(null)
    const keBarRef = useRef<THREE.Mesh>(null)

    // Natural length position for mass (where spring is relaxed)
    const naturalLength = 2.5
    const wallX = -0.5

    useFrame(() => {
      if (!springGroupRef.current || !massRef.current) return

      const displacement = displacementRef.current
      const _velocity = velocityValRef.current
      void _velocity

      // Mass position: natural length + displacement
      // Negative displacement = compressed (mass closer to wall)
      // Positive displacement = extended (mass farther from wall)
      const massX = naturalLength + displacement
      massRef.current.position.x = massX

      // Spring stretches from wall to mass
      const springLength = massX - wallX - 0.3 // Account for wall thickness
      if (springGroupRef.current) {
        springGroupRef.current.scale.x = Math.max(0.2, springLength / naturalLength)
        springGroupRef.current.position.x = wallX + 0.15 + springLength / 2
      }

      // Update force arrow (points in direction of spring force)
      if (forceArrowRef.current) {
        const forceScale = Math.abs(displacement) / amplitude
        forceArrowRef.current.scale.x = forceScale
        // Force points opposite to displacement
        forceArrowRef.current.rotation.z = displacement < 0 ? 0 : Math.PI
        forceArrowRef.current.position.x = massX + (displacement < 0 ? 0.5 : -0.5)
      }

      // Update energy bars
      const pe = peRef.current
      const ke = keRef.current
      if (peBarRef.current && keBarRef.current) {
        peBarRef.current.scale.y = Math.max(0.01, pe / maxPE)
        keBarRef.current.scale.y = Math.max(0.01, ke / maxPE)
      }
    })

    return (
      <>
        {/* Ground plane */}
        <mesh position={[2, -0.5, 0]} receiveShadow>
          <boxGeometry args={[8, 0.1, 3]} />
          <meshStandardMaterial color="#333333" />
        </mesh>

        {/* Anchor wall */}
        <mesh position={[wallX, 0.5, 0]} castShadow>
          <boxGeometry args={[0.3, 2, 2]} />
          <meshStandardMaterial color="#555555" />
        </mesh>

        {/* Spring coil visual - horizontal zigzag */}
        <group ref={springGroupRef} position={[1, 0, 0]}>
          {Array.from({ length: 16 }).map((_, i) => {
            const t = i / 15
            const zigzag = Math.sin(i * Math.PI) * 0.15
            return (
              <mesh key={i} position={[(t - 0.5) * naturalLength, zigzag, 0]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#cc8844" metalness={0.6} roughness={0.4} />
              </mesh>
            )
          })}
          {/* Spring wire connections */}
          {Array.from({ length: 15 }).map((_, i) => {
            const t1 = i / 15
            const t2 = (i + 1) / 15
            const y1 = Math.sin(i * Math.PI) * 0.15
            const y2 = Math.sin((i + 1) * Math.PI) * 0.15
            const midX = ((t1 + t2) / 2 - 0.5) * naturalLength
            const midY = (y1 + y2) / 2
            const length = Math.sqrt(Math.pow((t2 - t1) * naturalLength, 2) + Math.pow(y2 - y1, 2))
            const angle = Math.atan2(y2 - y1, (t2 - t1) * naturalLength)
            return (
              <mesh key={`wire-${i}`} position={[midX, midY, 0]} rotation={[0, 0, angle]}>
                <cylinderGeometry args={[0.02, 0.02, length, 6]} />
                <meshStandardMaterial color="#aa7733" metalness={0.7} roughness={0.3} />
              </mesh>
            )
          })}
        </group>

        {/* Mass block */}
        <group ref={massRef} position={[naturalLength, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#4488ff" />
          </mesh>
          <Text
            position={[0, 0, 0.3]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {mass} kg
          </Text>
        </group>

        {/* Force arrow (spring force on mass) */}
        <group ref={forceArrowRef} position={[naturalLength + 0.5, 0, 0]}>
          <mesh position={[0.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
            <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0.85, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.1, 0.2, 8]} />
            <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.3} />
          </mesh>
        </group>

        {/* Equilibrium position marker */}
        <group position={[naturalLength, -0.4, 0]}>
          <mesh>
            <boxGeometry args={[0.05, 0.3, 0.5]} />
            <meshStandardMaterial color="#ffff00" transparent opacity={0.7} />
          </mesh>
          <Text
            position={[0, -0.35, 0]}
            fontSize={0.12}
            color="#ffff00"
            anchorX="center"
            anchorY="top"
          >
            x=0
          </Text>
        </group>

        {/* Compression limit marker */}
        <group position={[naturalLength - amplitude, -0.4, 0]}>
          <mesh>
            <boxGeometry args={[0.03, 0.2, 0.3]} />
            <meshStandardMaterial color="#ff8800" transparent opacity={0.6} />
          </mesh>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.1}
            color="#ff8800"
            anchorX="center"
            anchorY="top"
          >
            -{amplitude.toFixed(2)}m
          </Text>
        </group>

        {/* Extension limit marker */}
        <group position={[naturalLength + amplitude, -0.4, 0]}>
          <mesh>
            <boxGeometry args={[0.03, 0.2, 0.3]} />
            <meshStandardMaterial color="#88ff00" transparent opacity={0.6} />
          </mesh>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.1}
            color="#88ff00"
            anchorX="center"
            anchorY="top"
          >
            +{amplitude.toFixed(2)}m
          </Text>
        </group>

        {/* Energy bars */}
        <group position={[5, 0, 0]}>
          {/* PE bar (elastic potential energy) */}
          <group position={[0, 0, 0]}>
            <mesh ref={peBarRef} position={[0, 0.5, 0]}>
              <boxGeometry args={[0.3, 1, 0.3]} />
              <meshStandardMaterial color="#ff8800" emissive="#ff8800" emissiveIntensity={0.2} />
            </mesh>
            <Text position={[0, -0.2, 0]} fontSize={0.12} color="#ff8800" anchorX="center">
              PE
            </Text>
            <Text position={[0, 1.2, 0]} fontSize={0.1} color="#ffffff" anchorX="center">
              {peRef.current.toFixed(1)} J
            </Text>
          </group>

          {/* KE bar (kinetic energy) */}
          <group position={[0.6, 0, 0]}>
            <mesh ref={keBarRef} position={[0, 0.5, 0]}>
              <boxGeometry args={[0.3, 1, 0.3]} />
              <meshStandardMaterial color="#44ff44" emissive="#44ff44" emissiveIntensity={0.2} />
            </mesh>
            <Text position={[0, -0.2, 0]} fontSize={0.12} color="#44ff44" anchorX="center">
              KE
            </Text>
            <Text position={[0, 1.2, 0]} fontSize={0.1} color="#ffffff" anchorX="center">
              {keRef.current.toFixed(1)} J
            </Text>
          </group>

          {/* Total energy label */}
          <Text position={[0.3, 1.6, 0]} fontSize={0.12} color="#ffffff" anchorX="center">
            Total: {maxPE.toFixed(1)} J
          </Text>
        </group>

        {/* Physics info labels */}
        <group position={[-1, 2, 0]}>
          <Text position={[0, 0.4, 0]} fontSize={0.15} color="#ffffff" anchorX="left">
            k = {springConstant} N/m
          </Text>
          <Text position={[0, 0.2, 0]} fontSize={0.15} color="#ffffff" anchorX="left">
            F_max = {maxForce.toFixed(1)} N
          </Text>
          <Text position={[0, 0, 0]} fontSize={0.15} color="#ffffff" anchorX="left">
            PE_max = ½kx² = {maxPE.toFixed(2)} J
          </Text>
        </group>
      </>
    )
  }

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <SpringVisual />
    </group>
  )
}

// ============================================
// CIRCULAR MOTION STRING
// ============================================
interface CircularMotionStringProps {
  mass: number                    // kg
  radius: number                  // m
  speed: number                   // m/s (tangential)
  plane?: 'horizontal' | 'vertical' | 'conical'
  stringLength?: number           // m (for conical pendulum)
  pivotPosition?: [number, number, number]
  gravity?: number                // m/s² (default 9.81)
  resetTrigger?: number
  timeScale?: number
  isPaused?: boolean
  onUpdate?: (data: {
    position: THREE.Vector3
    velocity: THREE.Vector3
    time: number
    centripetalAcceleration: number
    tension: number
    angle: number
  }) => void
}

export function CircularMotionString({
  mass,
  radius,
  speed,
  plane = 'horizontal',
  stringLength,
  pivotPosition = [0, 5, 0],
  gravity = 9.81,
  resetTrigger = 0,
  timeScale = 1,
  isPaused = false,
  onUpdate
}: CircularMotionStringProps) {
  const timeRef = useRef(0)
  const angleRef = useRef(0)
  const groupRef = useRef<THREE.Group>(null)
  const massRef = useRef<THREE.Mesh>(null)
  const stringRef = useRef<THREE.Line>(null)

  // Physics calculations
  const g = gravity
  const centripetalAcceleration = (speed * speed) / radius
  const angularVelocity = speed / radius

  // Tension depends on plane
  let tension: number
  if (plane === 'horizontal') {
    // Horizontal plane: T = mv²/r (centripetal force only)
    tension = mass * centripetalAcceleration
  } else if (plane === 'vertical') {
    // Vertical plane: T varies with position (max at bottom, min at top)
    // At bottom: T = mv²/r + mg
    // At top: T = mv²/r - mg
    tension = mass * centripetalAcceleration + mass * g // Default to bottom
  } else {
    // Conical pendulum: T = mg / cos(θ)
    const actualStringLength = stringLength || radius * 1.5
    const coneAngle = Math.asin(radius / actualStringLength)
    tension = (mass * g) / Math.cos(coneAngle)
  }

  // Reset when resetTrigger changes
  useEffect(() => {
    timeRef.current = 0
    angleRef.current = 0
  }, [resetTrigger])

  useFrame((_, delta) => {
    if (isPaused) return

    timeRef.current += delta * timeScale
    angleRef.current += angularVelocity * delta * timeScale

    // Calculate position based on plane
    let x: number, y: number, z: number
    let vx: number, vy: number, vz: number

    if (plane === 'horizontal') {
      // Horizontal circular motion
      x = pivotPosition[0] + radius * Math.cos(angleRef.current)
      y = pivotPosition[1] - 0.5 // Slightly below pivot
      z = pivotPosition[2] + radius * Math.sin(angleRef.current)
      // Velocity is tangent to circle
      vx = -speed * Math.sin(angleRef.current)
      vy = 0
      vz = speed * Math.cos(angleRef.current)
    } else if (plane === 'vertical') {
      // Vertical circular motion (in XY plane)
      x = pivotPosition[0] + radius * Math.cos(angleRef.current)
      y = pivotPosition[1] + radius * Math.sin(angleRef.current)
      z = pivotPosition[2]
      vx = -speed * Math.sin(angleRef.current)
      vy = speed * Math.cos(angleRef.current)
      vz = 0
      // Update tension based on position
      const currentAngle = angleRef.current % (2 * Math.PI)
      tension = mass * centripetalAcceleration + mass * g * Math.sin(currentAngle)
    } else {
      // Conical pendulum
      const actualStringLength = stringLength || radius * 1.5
      const coneAngle = Math.asin(radius / actualStringLength)
      const height = actualStringLength * Math.cos(coneAngle)

      x = pivotPosition[0] + radius * Math.cos(angleRef.current)
      y = pivotPosition[1] - height
      z = pivotPosition[2] + radius * Math.sin(angleRef.current)
      vx = -speed * Math.sin(angleRef.current)
      vy = 0
      vz = speed * Math.cos(angleRef.current)
    }

    // Update mesh positions
    if (massRef.current) {
      massRef.current.position.set(x, y, z)
    }

    // Update string
    if (stringRef.current) {
      const positions = stringRef.current.geometry.attributes.position
      positions.setXYZ(0, pivotPosition[0], pivotPosition[1], pivotPosition[2])
      positions.setXYZ(1, x, y, z)
      positions.needsUpdate = true
    }

    if (onUpdate) {
      onUpdate({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(vx, vy, vz),
        time: timeRef.current,
        centripetalAcceleration,
        tension,
        angle: angleRef.current
      })
    }
  })

  return (
    <group ref={groupRef}>
      {/* Pivot point */}
      <mesh position={pivotPosition as [number, number, number]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* String */}
      <line ref={stringRef as any}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([
              pivotPosition[0], pivotPosition[1], pivotPosition[2],
              pivotPosition[0] + radius, pivotPosition[1] - 0.5, pivotPosition[2]
            ]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#cccccc" linewidth={2} />
      </line>

      {/* Mass (sphere) */}
      <mesh ref={massRef} position={[pivotPosition[0] + radius, pivotPosition[1] - 0.5, pivotPosition[2]]} castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#ff4080" />
      </mesh>

      {/* Center marker for horizontal plane */}
      {plane === 'horizontal' && (
        <mesh position={[pivotPosition[0], pivotPosition[1] - 0.5, pivotPosition[2]]}>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      )}

      {/* Radius indicator circle */}
      {plane === 'horizontal' && (
        <mesh position={[pivotPosition[0], pivotPosition[1] - 0.49, pivotPosition[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
          <meshBasicMaterial color="#444444" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

// ============================================
// HORIZONTAL PUSH (Newton's Laws with Friction)
// ============================================
interface HorizontalPushProps {
  mass: number                      // kg
  appliedForce: number              // N
  staticFrictionCoeff: number       // μs
  kineticFrictionCoeff: number      // μk
  gravity?: number                  // m/s² (default 9.81)
  resetTrigger?: number
  timeScale?: number
  isPaused?: boolean
  onUpdate?: (data: {
    position: THREE.Vector3
    velocity: THREE.Vector3
    acceleration: THREE.Vector3
    time: number
    frictionState: 'static' | 'kinetic'
    netForce: number
    frictionForce: number
  }) => void
}

export function HorizontalPush({
  mass,
  appliedForce,
  staticFrictionCoeff,
  kineticFrictionCoeff,
  gravity = 9.81,
  resetTrigger = 0,
  timeScale = 1,
  isPaused = false,
  onUpdate
}: HorizontalPushProps) {
  const timeRef = useRef(0)
  const positionRef = useRef(0)
  const velocityRef = useRef(0)
  const boxRef = useRef<THREE.Mesh>(null)

  const g = gravity
  const normalForce = mass * g
  const maxStaticFriction = staticFrictionCoeff * normalForce
  const kineticFriction = kineticFrictionCoeff * normalForce

  // Determine if object moves
  const willMove = appliedForce > maxStaticFriction

  // Reset when resetTrigger changes
  useEffect(() => {
    timeRef.current = 0
    positionRef.current = 0
    velocityRef.current = 0
  }, [resetTrigger])

  useFrame((_, delta) => {
    if (isPaused) return

    const dt = delta * timeScale
    timeRef.current += dt

    let frictionState: 'static' | 'kinetic' = 'static'
    let frictionForce: number
    let acceleration: number

    if (willMove || velocityRef.current > 0.001) {
      // Kinetic friction applies
      frictionState = 'kinetic'
      frictionForce = kineticFriction
      const netForce = appliedForce - frictionForce
      acceleration = netForce / mass

      // Update velocity and position
      velocityRef.current += acceleration * dt
      if (velocityRef.current < 0) velocityRef.current = 0 // Can't go backwards
      positionRef.current += velocityRef.current * dt
    } else {
      // Static friction (object doesn't move)
      frictionState = 'static'
      frictionForce = appliedForce // Static friction matches applied force
      acceleration = 0
    }

    // Update mesh position
    if (boxRef.current) {
      boxRef.current.position.x = positionRef.current
    }

    if (onUpdate) {
      onUpdate({
        position: new THREE.Vector3(positionRef.current, 0.5, 0),
        velocity: new THREE.Vector3(velocityRef.current, 0, 0),
        acceleration: new THREE.Vector3(acceleration, 0, 0),
        time: timeRef.current,
        frictionState,
        netForce: appliedForce - frictionForce,
        frictionForce
      })
    }
  })

  return (
    <group>
      {/* Ground surface with texture */}
      <mesh position={[5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[15, 4]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Box */}
      <mesh ref={boxRef} position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4080ff" />
      </mesh>

      {/* Applied force arrow (blue) */}
      <group position={[-0.7, 0.5, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, appliedForce / 20, 8]} />
          <meshStandardMaterial color="#4488ff" emissive="#4488ff" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[appliedForce / 40, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.12, 0.3, 8]} />
          <meshStandardMaterial color="#4488ff" emissive="#4488ff" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Friction arrow (red, opposite direction) */}
      {(willMove || velocityRef.current > 0) && (
        <group position={[0.7, 0.5, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, kineticFriction / 20, 8]} />
            <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[-kineticFriction / 40, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.12, 0.3, 8]} />
            <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}

      {/* Weight arrow (orange, down) */}
      <group position={[0, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <meshStandardMaterial color="#ff8800" />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <meshStandardMaterial color="#ff8800" />
        </mesh>
      </group>

      {/* Normal force arrow (green, up) */}
      <group position={[0, 1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <meshStandardMaterial color="#44ff44" />
        </mesh>
        <mesh position={[0, 0.35, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <meshStandardMaterial color="#44ff44" />
        </mesh>
      </group>
    </group>
  )
}

// ============================================
// ELEVATOR (Apparent Weight)
// ============================================
interface ElevatorProps {
  personMass: number                // kg
  elevatorAcceleration: number      // m/s² (+ up, - down)
  maxHeight?: number                // m
  gravity?: number                  // m/s² (default 9.81)
  resetTrigger?: number
  timeScale?: number
  isPaused?: boolean
  onUpdate?: (data: {
    position: THREE.Vector3
    velocity: THREE.Vector3
    time: number
    apparentWeight: number
    scaleReading: number
  }) => void
}

export function Elevator({
  personMass,
  elevatorAcceleration,
  maxHeight = 20,
  gravity = 9.81,
  resetTrigger = 0,
  timeScale = 1,
  isPaused = false,
  onUpdate
}: ElevatorProps) {
  const timeRef = useRef(0)
  const positionRef = useRef(0)
  const velocityRef = useRef(0)
  const elevatorRef = useRef<THREE.Group>(null)

  const g = gravity
  const actualWeight = personMass * g
  const apparentWeight = personMass * (g + elevatorAcceleration)
  const scaleReading = Math.max(0, apparentWeight)

  // Reset when resetTrigger changes
  useEffect(() => {
    timeRef.current = 0
    positionRef.current = 0
    velocityRef.current = 0
  }, [resetTrigger])

  useFrame((_, delta) => {
    if (isPaused) return

    const dt = delta * timeScale
    timeRef.current += dt

    // Update elevator motion
    velocityRef.current += elevatorAcceleration * dt
    positionRef.current += velocityRef.current * dt

    // Clamp position
    if (positionRef.current > maxHeight) {
      positionRef.current = maxHeight
      velocityRef.current = 0
    }
    if (positionRef.current < 0) {
      positionRef.current = 0
      velocityRef.current = 0
    }

    // Update elevator position
    if (elevatorRef.current) {
      elevatorRef.current.position.y = positionRef.current
    }

    if (onUpdate) {
      onUpdate({
        position: new THREE.Vector3(0, positionRef.current, 0),
        velocity: new THREE.Vector3(0, velocityRef.current, 0),
        time: timeRef.current,
        apparentWeight,
        scaleReading
      })
    }
  })

  return (
    <group>
      {/* Elevator shaft (vertical guide) */}
      <mesh position={[-2.5, maxHeight / 2, 0]}>
        <boxGeometry args={[0.1, maxHeight + 2, 0.1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[2.5, maxHeight / 2, 0]}>
        <boxGeometry args={[0.1, maxHeight + 2, 0.1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Elevator car */}
      <group ref={elevatorRef} position={[0, 0, 0]}>
        {/* Floor */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[4, 0.2, 3]} />
          <meshStandardMaterial color="#555555" />
        </mesh>

        {/* Back wall (semi-transparent) */}
        <mesh position={[0, 2, -1.4]}>
          <boxGeometry args={[4, 4, 0.1]} />
          <meshStandardMaterial color="#666666" transparent opacity={0.3} />
        </mesh>

        {/* Side walls (semi-transparent) */}
        <mesh position={[-1.95, 2, 0]}>
          <boxGeometry args={[0.1, 4, 3]} />
          <meshStandardMaterial color="#666666" transparent opacity={0.3} />
        </mesh>
        <mesh position={[1.95, 2, 0]}>
          <boxGeometry args={[0.1, 4, 3]} />
          <meshStandardMaterial color="#666666" transparent opacity={0.3} />
        </mesh>

        {/* Ceiling */}
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[4, 0.1, 3]} />
          <meshStandardMaterial color="#444444" />
        </mesh>

        {/* Scale platform */}
        <mesh position={[0, 0.15, 0.5]} receiveShadow>
          <boxGeometry args={[1, 0.1, 1]} />
          <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Person figure (simplified) */}
        <group position={[0, 0.2, 0.5]}>
          {/* Body */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.3, 1.2, 8]} />
            <meshStandardMaterial color="#3366cc" />
          </mesh>
          {/* Head */}
          <mesh position={[0, 1.7, 0]} castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#ffcc99" />
          </mesh>
        </group>

        {/* Scale display */}
        <mesh position={[0, 0.5, 1.2]}>
          <boxGeometry args={[0.8, 0.4, 0.1]} />
          <meshStandardMaterial color="#111111" />
        </mesh>

        {/* Weight arrow (actual weight - orange, down) */}
        <group position={[0.8, 1.2, 0.5]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, actualWeight / 200, 8]} />
            <meshStandardMaterial color="#ff8800" />
          </mesh>
          <mesh position={[0, -actualWeight / 400, 0]}>
            <coneGeometry args={[0.08, 0.15, 8]} />
            <meshStandardMaterial color="#ff8800" />
          </mesh>
        </group>

        {/* Normal force arrow (scale reading - green, up) */}
        <group position={[-0.8, 1.2, 0.5]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, scaleReading / 200, 8]} />
            <meshStandardMaterial color="#44ff44" />
          </mesh>
          <mesh position={[0, scaleReading / 400, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.08, 0.15, 8]} />
            <meshStandardMaterial color="#44ff44" />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// ============================================
// TWO ROPE TENSION
// ============================================
interface TwoRopeTensionProps {
  mass: number                      // kg
  ropeAngle: number                 // degrees from vertical (symmetric)
  gravity?: number                  // m/s² (default 9.81)
  resetTrigger?: number
  onUpdate?: (data: {
    position: THREE.Vector3
    tension: number
    angle: number
    weight: number
  }) => void
}

export function TwoRopeTension({
  mass,
  ropeAngle,
  gravity = 9.81,
  resetTrigger: _resetTrigger = 0,
  onUpdate
}: TwoRopeTensionProps) {
  void _resetTrigger; // Static scene, no reset needed
  const g = gravity
  const weight = mass * g
  const angleRad = (ropeAngle * Math.PI) / 180
  const tension = weight / (2 * Math.cos(angleRad))

  // Box dimensions - scale with mass for visual effect
  const baseSize = 0.6
  const massScale = Math.cbrt(mass / 5) // Cube root scaling for volume
  const boxWidth = baseSize * massScale
  const boxHeight = baseSize * massScale
  const boxDepth = baseSize * massScale

  // Ceiling height
  const ceilingY = 5

  // Rope length (visual) - determines how far down the box hangs
  const ropeLength = 3

  // Calculate positions based on geometry
  // The ropes hang at angle from vertical, meeting at the box top corners

  // Vertical drop of rope
  const ropeVertical = ropeLength * Math.cos(angleRad)
  // Horizontal spread of rope from attachment point to anchor
  const ropeHorizontal = ropeLength * Math.sin(angleRad)

  // Box top Y position (where ropes attach to top corners)
  const boxTopY = ceilingY - ropeVertical
  // Box center Y
  const boxCenterY = boxTopY - boxHeight / 2

  // Box attachment points (top left and right corners)
  const leftAttachX = -boxWidth / 2
  const rightAttachX = boxWidth / 2
  const attachY = boxTopY

  // Ceiling anchor points
  // Left anchor: go up and left from left attachment point
  const leftAnchorX = leftAttachX - ropeHorizontal
  // Right anchor: go up and right from right attachment point
  const rightAnchorX = rightAttachX + ropeHorizontal
  const anchorY = ceilingY

  // Calculate actual rope length (should equal ropeLength, but recalculate for positioning)
  const actualRopeLength = Math.sqrt(
    Math.pow(ropeHorizontal, 2) + Math.pow(ropeVertical, 2)
  )

  // Rope midpoints for cylinder positioning
  const leftRopeMidX = (leftAnchorX + leftAttachX) / 2
  const leftRopeMidY = (anchorY + attachY) / 2
  const rightRopeMidX = (rightAnchorX + rightAttachX) / 2
  const rightRopeMidY = (anchorY + attachY) / 2

  // Ceiling bar width (needs to span both anchors plus margin)
  const ceilingBarWidth = Math.abs(rightAnchorX - leftAnchorX) + 1

  // Report to parent
  useEffect(() => {
    if (onUpdate) {
      onUpdate({
        position: new THREE.Vector3(0, boxCenterY, 0),
        tension,
        angle: ropeAngle,
        weight
      })
    }
  }, [mass, ropeAngle, gravity, onUpdate, boxCenterY, tension, weight])

  return (
    <group>
      {/* Ceiling bar */}
      <mesh position={[0, ceilingY + 0.1, 0]} castShadow>
        <boxGeometry args={[ceilingBarWidth, 0.2, 0.5]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Left anchor point */}
      <mesh position={[leftAnchorX, anchorY, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Right anchor point */}
      <mesh position={[rightAnchorX, anchorY, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Left rope - cylinder from anchor to box top-left corner */}
      <mesh
        position={[leftRopeMidX, leftRopeMidY, 0]}
        rotation={[0, 0, angleRad]}
      >
        <cylinderGeometry args={[0.025, 0.025, actualRopeLength, 8]} />
        <meshStandardMaterial color="#aa8866" />
      </mesh>

      {/* Right rope - cylinder from anchor to box top-right corner */}
      <mesh
        position={[rightRopeMidX, rightRopeMidY, 0]}
        rotation={[0, 0, -angleRad]}
      >
        <cylinderGeometry args={[0.025, 0.025, actualRopeLength, 8]} />
        <meshStandardMaterial color="#aa8866" />
      </mesh>

      {/* Small attachment rings on box corners */}
      <mesh position={[leftAttachX, attachY, 0]}>
        <torusGeometry args={[0.04, 0.015, 8, 16]} />
        <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[rightAttachX, attachY, 0]}>
        <torusGeometry args={[0.04, 0.015, 8, 16]} />
        <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Hanging mass (box) */}
      <mesh position={[0, boxCenterY, 0]} castShadow>
        <boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
        <meshStandardMaterial color="#4080ff" />
      </mesh>

      {/* Mass label on box */}
      <Text
        position={[0, boxCenterY, boxDepth / 2 + 0.05]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {mass} kg
      </Text>

      {/* Weight vector (down from box center) */}
      {(() => {
        const weightArrowScale = 0.08
        const minArrowLength = 0.8
        const maxArrowLength = 2.5
        const weightArrowLength = Math.min(maxArrowLength, Math.max(minArrowLength, weight * weightArrowScale))
        const shaftRadius = 0.04
        const headRadius = 0.12
        const headLength = 0.25
        const shaftLength = weightArrowLength - headLength

        return (
          <group position={[0, boxCenterY, 0.1]}>
            {/* Arrow shaft pointing down */}
            <mesh position={[0, -shaftLength / 2, 0]}>
              <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 12]} />
              <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.3} />
            </mesh>
            {/* Arrow head pointing down - rotate 180° so tip points down */}
            <mesh position={[0, -shaftLength - headLength / 2, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[headRadius, headLength, 12]} />
              <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.3} />
            </mesh>
          </group>
        )
      })()}
      {/* Weight label */}
      <Text
        position={[0.4, boxCenterY - 0.8, 0.1]}
        fontSize={0.2}
        color="#ff6600"
        anchorX="left"
        anchorY="middle"
      >
        W = {weight.toFixed(1)} N
      </Text>

      {/* Force vectors - all originating from box center for clarity */}
      {(() => {
        // Arrow scaling - make arrows proportional but visible
        const arrowScale = 0.08 // Scale factor for force magnitude to arrow length
        const minArrowLength = 0.8
        const maxArrowLength = 2.5
        const tensionArrowLength = Math.min(maxArrowLength, Math.max(minArrowLength, tension * arrowScale))
        const shaftRadius = 0.04
        const headRadius = 0.12
        const headLength = 0.25
        const shaftLength = tensionArrowLength - headLength

        return (
          <>
            {/* Left tension arrow - pulls up and to the left along rope */}
            <group position={[0, boxCenterY, 0]}>
              {/* Arrow shaft */}
              <mesh
                position={[
                  -Math.sin(angleRad) * (shaftLength / 2),
                  Math.cos(angleRad) * (shaftLength / 2),
                  0.1
                ]}
                rotation={[0, 0, angleRad]}
              >
                <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 12]} />
                <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} />
              </mesh>
              {/* Arrow head (cone tip pointing outward along rope direction) */}
              <mesh
                position={[
                  -Math.sin(angleRad) * (shaftLength + headLength / 2),
                  Math.cos(angleRad) * (shaftLength + headLength / 2),
                  0.1
                ]}
                rotation={[0, 0, angleRad]}
              >
                <coneGeometry args={[headRadius, headLength, 12]} />
                <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} />
              </mesh>
            </group>

            {/* Right tension arrow - pulls up and to the right along rope */}
            <group position={[0, boxCenterY, 0]}>
              {/* Arrow shaft */}
              <mesh
                position={[
                  Math.sin(angleRad) * (shaftLength / 2),
                  Math.cos(angleRad) * (shaftLength / 2),
                  0.1
                ]}
                rotation={[0, 0, -angleRad]}
              >
                <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 12]} />
                <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} />
              </mesh>
              {/* Arrow head (cone tip pointing outward along rope direction) */}
              <mesh
                position={[
                  Math.sin(angleRad) * (shaftLength + headLength / 2),
                  Math.cos(angleRad) * (shaftLength + headLength / 2),
                  0.1
                ]}
                rotation={[0, 0, -angleRad]}
              >
                <coneGeometry args={[headRadius, headLength, 12]} />
                <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} />
              </mesh>
            </group>
          </>
        )
      })()}

      {/* Tension labels */}
      <Text
        position={[leftAnchorX - 0.4, (anchorY + attachY) / 2, 0]}
        fontSize={0.18}
        color="#44ff44"
        anchorX="right"
        anchorY="middle"
      >
        T₁ = {tension.toFixed(1)} N
      </Text>
      <Text
        position={[rightAnchorX + 0.4, (anchorY + attachY) / 2, 0]}
        fontSize={0.18}
        color="#44ff44"
        anchorX="left"
        anchorY="middle"
      >
        T₂ = {tension.toFixed(1)} N
      </Text>

      {/* Vertical reference lines at anchors (dashed effect with small spheres) */}
      <group position={[leftAnchorX, anchorY, 0]}>
        {/* Vertical dashed line */}
        {[0.15, 0.3, 0.45, 0.6].map((d, i) => (
          <mesh key={`left-dash-${i}`} position={[0, -d, 0]}>
            <boxGeometry args={[0.01, 0.08, 0.01]} />
            <meshStandardMaterial color="#ffff00" />
          </mesh>
        ))}
        {/* Angle arc indicator */}
        <Text
          position={[0.25, -0.35, 0]}
          fontSize={0.16}
          color="#ffff00"
          anchorX="left"
          anchorY="middle"
        >
          θ = {ropeAngle}°
        </Text>
      </group>

      <group position={[rightAnchorX, anchorY, 0]}>
        {/* Vertical dashed line */}
        {[0.15, 0.3, 0.45, 0.6].map((d, i) => (
          <mesh key={`right-dash-${i}`} position={[0, -d, 0]}>
            <boxGeometry args={[0.01, 0.08, 0.01]} />
            <meshStandardMaterial color="#ffff00" />
          </mesh>
        ))}
        {/* Angle arc indicator */}
        <Text
          position={[-0.25, -0.35, 0]}
          fontSize={0.16}
          color="#ffff00"
          anchorX="right"
          anchorY="middle"
        >
          θ = {ropeAngle}°
        </Text>
      </group>

      {/* Physics explanation text */}
      <Text
        position={[0, ceilingY + 0.6, 0]}
        fontSize={0.15}
        color="#aaaaaa"
        anchorX="center"
        anchorY="bottom"
      >
        T = W / (2·cos θ) = {weight.toFixed(1)} / (2·cos {ropeAngle}°) = {tension.toFixed(1)} N
      </Text>
    </group>
  )
}

// ============================================
// ATWOOD MACHINE
// ============================================
interface AtwoodMachineProps {
  mass1: number                     // kg (left side)
  mass2: number                     // kg (right side)
  pulleyRadius?: number             // m
  initialHeight1?: number           // m (left mass starting height)
  gravity?: number                  // m/s² (default 9.81)
  resetTrigger?: number
  timeScale?: number
  isPaused?: boolean
  onUpdate?: (data: {
    position1: THREE.Vector3
    position2: THREE.Vector3
    velocity: number
    acceleration: number
    tension: number
    time: number
  }) => void
}

export function AtwoodMachine({
  mass1,
  mass2,
  pulleyRadius = 0.3,
  initialHeight1 = 5,
  gravity = 9.81,
  resetTrigger = 0,
  timeScale = 1,
  isPaused = false,
  onUpdate
}: AtwoodMachineProps) {
  const timeRef = useRef(0)
  const position1Ref = useRef(initialHeight1)
  const velocityRef = useRef(0)
  const mass1Ref = useRef<THREE.Mesh>(null)
  const mass2Ref = useRef<THREE.Mesh>(null)
  const pulleyRef = useRef<THREE.Mesh>(null)

  const g = gravity
  const totalMass = mass1 + mass2
  const acceleration = ((mass2 - mass1) * g) / totalMass
  const tension = (2 * mass1 * mass2 * g) / totalMass

  // Initial position of mass2 (constraint: rope length constant)
  const ropeLength = 10 // Total rope length
  const initialHeight2 = ropeLength - initialHeight1

  // Reset when resetTrigger changes
  useEffect(() => {
    timeRef.current = 0
    position1Ref.current = initialHeight1
    velocityRef.current = 0
  }, [resetTrigger, initialHeight1])

  useFrame((_, delta) => {
    if (isPaused) return

    const dt = delta * timeScale
    timeRef.current += dt

    // Update velocity and position
    velocityRef.current += acceleration * dt
    position1Ref.current -= velocityRef.current * dt // mass1 goes down if m2 > m1

    // Clamp positions
    const minHeight = 1
    const maxHeight = 8
    if (position1Ref.current < minHeight) {
      position1Ref.current = minHeight
      velocityRef.current = 0
    }
    if (position1Ref.current > maxHeight) {
      position1Ref.current = maxHeight
      velocityRef.current = 0
    }

    const position2 = ropeLength - position1Ref.current

    // Update mesh positions
    if (mass1Ref.current) {
      mass1Ref.current.position.y = position1Ref.current
    }
    if (mass2Ref.current) {
      mass2Ref.current.position.y = position2
    }

    // Rotate pulley based on velocity
    if (pulleyRef.current) {
      pulleyRef.current.rotation.z += velocityRef.current * dt / pulleyRadius
    }

    if (onUpdate) {
      onUpdate({
        position1: new THREE.Vector3(-1.5, position1Ref.current, 0),
        position2: new THREE.Vector3(1.5, position2, 0),
        velocity: velocityRef.current,
        acceleration,
        tension,
        time: timeRef.current
      })
    }
  })

  return (
    <group>
      {/* Support structure */}
      <mesh position={[0, 9.5, 0]} castShadow>
        <boxGeometry args={[4, 0.3, 0.5]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      <mesh position={[-1.8, 5, 0]} castShadow>
        <boxGeometry args={[0.2, 9, 0.3]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      <mesh position={[1.8, 5, 0]} castShadow>
        <boxGeometry args={[0.2, 9, 0.3]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Pulley wheel */}
      <mesh ref={pulleyRef} position={[0, 9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[pulleyRadius, pulleyRadius, 0.2, 32]} />
        <meshStandardMaterial color="#666666" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[pulleyRadius * 0.3, pulleyRadius * 0.3, 0.25, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Rope - left side (simplified as cylinder) */}
      <mesh position={[-pulleyRadius, (9 + initialHeight1) / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 9 - initialHeight1 + 1, 8]} />
        <meshStandardMaterial color="#aa8866" />
      </mesh>

      {/* Rope - right side */}
      <mesh position={[pulleyRadius, (9 + initialHeight2) / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 9 - initialHeight2 + 1, 8]} />
        <meshStandardMaterial color="#aa8866" />
      </mesh>

      {/* Mass 1 (left) */}
      <mesh ref={mass1Ref} position={[-1.5, initialHeight1, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#4080ff" />
      </mesh>

      {/* Mass 2 (right) */}
      <mesh ref={mass2Ref} position={[1.5, initialHeight2, 0]} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color="#ff8040" />
      </mesh>
    </group>
  )
}

// ============================================
// TABLE PULLEY SYSTEM
// ============================================
interface TablePulleyProps {
  tableMass: number                 // kg (mass on table)
  hangingMass: number               // kg (mass hanging off edge)
  frictionCoefficient?: number      // μ for table surface
  tableLength?: number              // m
  gravity?: number                  // m/s² (default 9.81)
  resetTrigger?: number
  timeScale?: number
  isPaused?: boolean
  onUpdate?: (data: {
    tableBlockPosition: THREE.Vector3
    hangingBlockPosition: THREE.Vector3
    velocity: number
    acceleration: number
    tension: number
    time: number
  }) => void
}

export function TablePulley({
  tableMass,
  hangingMass,
  frictionCoefficient = 0,
  tableLength = 5,
  gravity = 9.81,
  resetTrigger = 0,
  timeScale = 1,
  isPaused = false,
  onUpdate
}: TablePulleyProps) {
  const timeRef = useRef(0)
  const tableBlockPosRef = useRef(1) // Initial X position on table
  const velocityRef = useRef(0)
  const tableBlockRef = useRef<THREE.Mesh>(null)
  const hangingBlockRef = useRef<THREE.Mesh>(null)

  const g = gravity
  const friction = frictionCoefficient * tableMass * g
  const netDrivingForce = hangingMass * g - friction
  const totalMass = tableMass + hangingMass
  const acceleration = Math.max(0, netDrivingForce / totalMass)
  const tension = hangingMass * (g - acceleration)

  const tableEdgeX = tableLength
  const tableHeight = 3
  const initialHangingY = tableHeight - 0.5

  // Reset when resetTrigger changes
  useEffect(() => {
    timeRef.current = 0
    tableBlockPosRef.current = 1
    velocityRef.current = 0
  }, [resetTrigger])

  useFrame((_, delta) => {
    if (isPaused) return

    const dt = delta * timeScale
    timeRef.current += dt

    // Update velocity and position
    velocityRef.current += acceleration * dt
    tableBlockPosRef.current += velocityRef.current * dt

    // Calculate hanging block position (moves down as table block moves right)
    const distanceTraveled = tableBlockPosRef.current - 1
    const hangingY = initialHangingY - distanceTraveled

    // Stop when table block reaches edge or hanging block hits ground
    if (tableBlockPosRef.current >= tableEdgeX - 0.5 || hangingY <= 0.3) {
      velocityRef.current = 0
    }

    // Update mesh positions
    if (tableBlockRef.current) {
      tableBlockRef.current.position.x = tableBlockPosRef.current
    }
    if (hangingBlockRef.current) {
      hangingBlockRef.current.position.y = hangingY
    }

    if (onUpdate) {
      onUpdate({
        tableBlockPosition: new THREE.Vector3(tableBlockPosRef.current, tableHeight + 0.3, 0),
        hangingBlockPosition: new THREE.Vector3(tableEdgeX + 0.5, hangingY, 0),
        velocity: velocityRef.current,
        acceleration,
        tension,
        time: timeRef.current
      })
    }
  })

  return (
    <group>
      {/* Table */}
      <mesh position={[tableLength / 2, tableHeight, 0]} receiveShadow>
        <boxGeometry args={[tableLength, 0.2, 2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Table legs */}
      <mesh position={[0.5, tableHeight / 2, 0.7]} castShadow>
        <boxGeometry args={[0.15, tableHeight, 0.15]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0.5, tableHeight / 2, -0.7]} castShadow>
        <boxGeometry args={[0.15, tableHeight, 0.15]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[tableLength - 0.5, tableHeight / 2, 0.7]} castShadow>
        <boxGeometry args={[0.15, tableHeight, 0.15]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[tableLength - 0.5, tableHeight / 2, -0.7]} castShadow>
        <boxGeometry args={[0.15, tableHeight, 0.15]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Pulley at table edge */}
      <mesh position={[tableEdgeX, tableHeight + 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#666666" metalness={0.5} />
      </mesh>

      {/* Block on table */}
      <mesh ref={tableBlockRef} position={[1, tableHeight + 0.3, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#4080ff" />
      </mesh>

      {/* Rope on table */}
      <mesh position={[(1 + tableEdgeX) / 2, tableHeight + 0.15, 0]}>
        <boxGeometry args={[tableEdgeX - 1.5, 0.03, 0.03]} />
        <meshStandardMaterial color="#aa8866" />
      </mesh>

      {/* Hanging rope */}
      <mesh position={[tableEdgeX + 0.2, (tableHeight + initialHangingY) / 2, 0]}>
        <boxGeometry args={[0.03, tableHeight - initialHangingY + 0.5, 0.03]} />
        <meshStandardMaterial color="#aa8866" />
      </mesh>

      {/* Hanging block */}
      <mesh ref={hangingBlockRef} position={[tableEdgeX + 0.5, initialHangingY, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#ff8040" />
      </mesh>

      {/* Friction arrow on table block (if friction exists) */}
      {frictionCoefficient > 0 && (
        <group position={[1.5, tableHeight + 0.3, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
            <meshStandardMaterial color="#ff4444" />
          </mesh>
        </group>
      )}
    </group>
  )
}

// ============================================
// CAR (for circular motion)
// ============================================
export function Car({
  radius = 50,
  speed = 13.4,
  bankAngle = 20,
  color = '#e63946',
  resetTrigger = 0,
  timeScale = 1,
  isPaused = false,
  onUpdate
}: CarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const angleRef = useRef(0)
  const timeRef = useRef(0)

  // Refs for each wheel to animate rotation
  const wheelFL = useRef<THREE.Group>(null)
  const wheelFR = useRef<THREE.Group>(null)
  const wheelRL = useRef<THREE.Group>(null)
  const wheelRR = useRef<THREE.Group>(null)

  // Reset when resetTrigger changes
  useEffect(() => {
    angleRef.current = 0
    timeRef.current = 0
  }, [resetTrigger])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Don't update if paused (but still report current state)
    if (!isPaused) {
      // Track elapsed physics time (scaled)
      timeRef.current += delta * timeScale

      // Angular velocity around the track = v / r (radians per second)
      const angularVelocity = speed / radius
      angleRef.current += angularVelocity * delta
    }

    const bankRad = (bankAngle * Math.PI) / 180
    const trackWidth = 10

    // Position on circle - car center follows the radius
    const x = Math.cos(angleRef.current) * radius
    const z = Math.sin(angleRef.current) * radius
    // Y position: track base + half track width * sin(bank) + car ground clearance
    const y = 1.5 + (trackWidth / 2) * Math.sin(bankRad) + 0.4

    groupRef.current.position.set(x, y, z)

    // Car orientation:
    // 1. Face tangent to circle (direction of travel) - car drives counterclockwise
    //    Tangent angle = track angle + 90° (perpendicular to radius)
    groupRef.current.rotation.y = -angleRef.current - Math.PI / 2

    // 2. Bank the car to match track (tilt toward center of turn)
    //    Use rotation order: first Y (heading), then local X (bank)
    groupRef.current.rotation.x = bankRad
    groupRef.current.rotation.z = 0

    // Animate wheels - rotate based on linear speed and wheel radius
    const wheelRadius = 0.4
    const wheelAngularVelocity = speed / wheelRadius // rad/s
    const wheelRotation = delta * wheelAngularVelocity

    // Rotate all wheels forward
    ;[wheelFL, wheelFR, wheelRL, wheelRR].forEach(wheel => {
      if (wheel.current) {
        wheel.current.rotation.x += wheelRotation
      }
    })

    if (onUpdate) {
      // Velocity is tangent to the circle (direction of travel)
      const vx = -Math.sin(angleRef.current) * speed
      const vz = Math.cos(angleRef.current) * speed
      onUpdate({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(vx, 0, vz),
        speed: speed,
        time: timeRef.current
      })
    }
  })

  const bodyColor = color

  return (
    <group ref={groupRef}>
      {/* Car body - main chassis */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[1.8, 0.6, 4]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Car body - cabin/roof */}
      <mesh castShadow position={[0, 0.85, 0.3]}>
        <boxGeometry args={[1.6, 0.55, 2]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Hood slope */}
      <mesh castShadow position={[0, 0.5, -1.3]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[1.6, 0.15, 1]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 0.75, -0.65]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[1.4, 0.5, 0.05]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.6} />
      </mesh>

      {/* Rear window */}
      <mesh position={[0, 0.75, 1.25]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[1.4, 0.45, 0.05]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.6} />
      </mesh>

      {/* Side windows */}
      <mesh position={[0.8, 0.8, 0.3]}>
        <boxGeometry args={[0.05, 0.35, 1.5]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.5} />
      </mesh>
      <mesh position={[-0.8, 0.8, 0.3]}>
        <boxGeometry args={[0.05, 0.35, 1.5]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.5} />
      </mesh>

      {/* Headlights */}
      <mesh position={[0.55, 0.35, -1.95]}>
        <boxGeometry args={[0.4, 0.2, 0.1]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff00" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-0.55, 0.35, -1.95]}>
        <boxGeometry args={[0.4, 0.2, 0.1]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff00" emissiveIntensity={0.8} />
      </mesh>

      {/* Taillights */}
      <mesh position={[0.6, 0.4, 1.95]}>
        <boxGeometry args={[0.35, 0.15, 0.1]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.6, 0.4, 1.95]}>
        <boxGeometry args={[0.35, 0.15, 0.1]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>

      {/* Grille */}
      <mesh position={[0, 0.25, -1.95]}>
        <boxGeometry args={[1, 0.3, 0.05]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Wheels - positioned at corners of car */}
      <AnimatedWheel position={[0.85, 0, -1.2]} wheelRef={wheelFL} isRight={true} />
      <AnimatedWheel position={[-0.85, 0, -1.2]} wheelRef={wheelFR} isRight={false} />
      <AnimatedWheel position={[0.85, 0, 1.2]} wheelRef={wheelRL} isRight={true} />
      <AnimatedWheel position={[-0.85, 0, 1.2]} wheelRef={wheelRR} isRight={false} />
    </group>
  )
}
