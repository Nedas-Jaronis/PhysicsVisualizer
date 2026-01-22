import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment, PerspectiveCamera, Text } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { Suspense } from 'react'

interface PhysicsSceneProps {
  children: React.ReactNode
  gravity?: [number, number, number]
  paused?: boolean
  debug?: boolean
  cameraPosition?: [number, number, number]
  cameraTarget?: [number, number, number]
}

export function PhysicsScene({
  children,
  gravity = [0, -9.81, 0],
  paused = false,
  debug = false,
  cameraPosition = [15, 12, 15],
  cameraTarget = [0, 5, 0]
}: PhysicsSceneProps) {
  return (
    <Canvas shadows style={{ background: '#0a0a0a' }}>
      <PerspectiveCamera makeDefault position={cameraPosition} fov={60} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={150}
        target={cameraTarget}
      />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      {/* Environment */}
      <Environment preset="night" />

      {/* Grid */}
      <Grid
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#333"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#555"
        fadeDistance={60}
        fadeStrength={1}
        followCamera={false}
        position={[0, 0, 0]}
      />

      {/* Height reference lines */}
      <group>
        {/* Vertical axis line */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, 0, 0, 30, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#444" />
        </line>
        {/* Height markers every 5 meters with labels */}
        {[5, 10, 15, 20, 25, 30].map((h) => (
          <group key={h}>
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([-0.5, h, 0, 0.5, h, 0])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#555" />
            </line>
            <Text
              position={[-1.2, h, 0]}
              fontSize={0.5}
              color="#666"
              anchorX="right"
              anchorY="middle"
            >
              {h}m
            </Text>
          </group>
        ))}
        {/* Ground level label */}
        <Text
          position={[-1.2, 0, 0]}
          fontSize={0.5}
          color="#666"
          anchorX="right"
          anchorY="middle"
        >
          0m
        </Text>
      </group>

      {/* Physics World */}
      <Suspense fallback={null}>
        <Physics
          gravity={gravity}
          paused={paused}
          debug={debug}
          timeStep="vary"
        >
          {children}
        </Physics>
      </Suspense>
    </Canvas>
  )
}
