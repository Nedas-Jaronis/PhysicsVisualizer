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
  onUpdate
}: PhysicsBoxProps) {
  const rigidRef = useRef<RapierRigidBody>(null)
  const velocitySet = useRef(false)

  // Only set initial velocity once on mount
  useEffect(() => {
    if (rigidRef.current && !velocitySet.current) {
      rigidRef.current.setLinvel({ x: velocity[0], y: velocity[1], z: velocity[2] }, true)
      velocitySet.current = true
    }
  }, []) // Empty dependency - only run on mount

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
  onUpdate
}: PhysicsSphereProps) {
  const rigidRef = useRef<RapierRigidBody>(null)
  const velocitySet = useRef(false)

  // Only set initial velocity once on mount
  useEffect(() => {
    if (rigidRef.current && !velocitySet.current) {
      rigidRef.current.setLinvel({ x: velocity[0], y: velocity[1], z: velocity[2] }, true)
      velocitySet.current = true
    }
  }, []) // Empty dependency - only run on mount

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
  size = [20, 20],
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
