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
  onUpdate?: (data: { position: THREE.Vector3; velocity: THREE.Vector3 }) => void
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
  onUpdate
}: PhysicsBoxProps) {
  const rigidRef = useRef<RapierRigidBody>(null)
  const initialMount = useRef(true)

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
  }, [resetTrigger])

  useFrame(() => {
    if (rigidRef.current && onUpdate) {
      const pos = rigidRef.current.translation()
      const vel = rigidRef.current.linvel()
      onUpdate({
        position: new THREE.Vector3(pos.x, pos.y, pos.z),
        velocity: new THREE.Vector3(vel.x, vel.y, vel.z)
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
  onUpdate?: (data: { position: THREE.Vector3; velocity: THREE.Vector3 }) => void
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
  onUpdate
}: PhysicsSphereProps) {
  const rigidRef = useRef<RapierRigidBody>(null)
  const initialMount = useRef(true)

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
  }, [resetTrigger])

  useFrame(() => {
    if (rigidRef.current && onUpdate) {
      const pos = rigidRef.current.translation()
      const vel = rigidRef.current.linvel()
      onUpdate({
        position: new THREE.Vector3(pos.x, pos.y, pos.z),
        velocity: new THREE.Vector3(vel.x, vel.y, vel.z)
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
  const markingCount = Math.floor(actualSegments / 16)
  const markings = []
  for (let i = 0; i < markingCount; i++) {
    const midAngle = ((i * 2 + 0.5) / markingCount) * (arcAngle * Math.PI / 360)
    const markR = radius
    markings.push(
      <mesh
        key={`mark-${i}`}
        position={[
          Math.cos(midAngle) * markR,
          1.3 + (trackWidth / 2) * Math.sin(bankRad),
          Math.sin(midAngle) * markR
        ]}
        rotation={[bankRad, -midAngle + Math.PI / 2, 0]}
      >
        <boxGeometry args={[4, 0.05, 0.3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    )
  }

  return (
    <group>
      {trackSegments}
      {barriers}
      {markings}
    </group>
  )
}

// ============================================
// CAR (for circular motion)
// ============================================
interface CarProps {
  radius?: number // radius of circular path
  speed?: number // tangential speed
  bankAngle?: number
  color?: string
  resetTrigger?: number
  onUpdate?: (data: { position: THREE.Vector3; velocity: THREE.Vector3; speed: number }) => void
}

export function Car({
  radius = 50,
  speed = 13.4,
  bankAngle = 20,
  color = '#e63946',
  resetTrigger = 0,
  onUpdate
}: CarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const angleRef = useRef(0)
  const wheelRotation = useRef(0)
  const startTimeRef = useRef(Date.now())

  // Reset when resetTrigger changes
  useEffect(() => {
    angleRef.current = 0
    wheelRotation.current = 0
    startTimeRef.current = Date.now()
  }, [resetTrigger])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Angular velocity = v / r
    const angularVelocity = speed / radius
    angleRef.current += angularVelocity * delta

    const bankRad = (bankAngle * Math.PI) / 180
    const trackWidth = 10 // Match the track width

    // Position on circle - car sits on the banked track surface
    const x = Math.cos(angleRef.current) * radius
    const z = Math.sin(angleRef.current) * radius
    // Y position accounts for track height and banking
    const y = 2 + (trackWidth / 2) * Math.sin(bankRad)

    groupRef.current.position.set(x, y, z)

    // Car faces tangent to circle (perpendicular to radius)
    // The car should face the direction of travel (forward along the curve)
    groupRef.current.rotation.y = -angleRef.current + Math.PI / 2

    // Bank the car to match the track angle
    groupRef.current.rotation.z = -bankRad

    // Rotate wheels based on speed
    wheelRotation.current += delta * speed * 3

    if (onUpdate) {
      // Velocity is tangent to the circle
      const vx = -Math.sin(angleRef.current) * speed
      const vz = Math.cos(angleRef.current) * speed
      onUpdate({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(vx, 0, vz),
        speed: speed
      })
    }
  })

  const bodyColor = color
  const wheelColor = '#1a1a1a'
  const windowColor = '#87ceeb'

  return (
    <group ref={groupRef}>
      {/* Car body - main */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[4, 0.8, 1.8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Car body - cabin */}
      <mesh castShadow position={[0.3, 1, 0]}>
        <boxGeometry args={[2, 0.7, 1.6]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Windshield */}
      <mesh position={[-0.6, 0.95, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.1, 0.6, 1.4]} />
        <meshStandardMaterial color={windowColor} transparent opacity={0.7} />
      </mesh>

      {/* Rear window */}
      <mesh position={[1.2, 0.95, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.1, 0.6, 1.4]} />
        <meshStandardMaterial color={windowColor} transparent opacity={0.7} />
      </mesh>

      {/* Headlights */}
      <mesh position={[-2, 0.4, 0.6]}>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#ffff99" emissive="#ffff00" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-2, 0.4, -0.6]}>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#ffff99" emissive="#ffff00" emissiveIntensity={0.5} />
      </mesh>

      {/* Taillights */}
      <mesh position={[2, 0.4, 0.6]}>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[2, 0.4, -0.6]}>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>

      {/* Wheels */}
      {[
        [-1.2, 0, 1],
        [-1.2, 0, -1],
        [1.2, 0, 1],
        [1.2, 0, -1]
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          {/* Tire */}
          <mesh castShadow rotation={[Math.PI / 2, wheelRotation.current, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color={wheelColor} />
          </mesh>
          {/* Hubcap */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, pos[2] > 0 ? 0.16 : -0.16]}>
            <cylinderGeometry args={[0.2, 0.2, 0.02, 16]} />
            <meshStandardMaterial color="#silver" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
