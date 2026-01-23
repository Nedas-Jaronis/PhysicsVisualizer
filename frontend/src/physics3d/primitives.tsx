import { useRef, useEffect } from 'react'
import { RigidBody, RapierRigidBody, useSpringJoint, usePrismaticJoint, BallCollider, CuboidCollider } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
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

  useSpringJoint(anchorRef, attachedBody, [
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
  onUpdate
}: PendulumProps) {
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
  pivotRef: React.RefObject<RapierRigidBody>
  bobRef: React.RefObject<RapierRigidBody>
}) {
  const lineRef = useRef<THREE.Line>(null)

  useFrame(() => {
    if (lineRef.current && pivotRef.current && bobRef.current) {
      const pivotPos = pivotRef.current.translation()
      const bobPos = bobRef.current.translation()
      const positions = lineRef.current.geometry.attributes.position
      positions.setXYZ(0, pivotPos.x, pivotPos.y, pivotPos.z)
      positions.setXYZ(1, bobPos.x, bobPos.y, bobPos.z)
      positions.needsUpdate = true
    }
  })

  return (
    <line ref={lineRef as any}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([0, 0, 0, 0, 0, 0])}
          itemSize={3}
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
  const lineRef = useRef<THREE.Line>(null)
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
  label
}: ForceArrowProps) {
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
  wheelRef: React.RefObject<THREE.Group>
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
