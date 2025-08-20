import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import GLBModel from "./GLBModel";
import ShootingStar from "./ShootingStarsComponent";

const BackgroundCanvas = () => {
  return (
    <Canvas
      className="background-canvas"
      camera={{ position: [0, 0, 10], fov: 45 }}
    >
      <ambientLight intensity={1} />

      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={6}
        fade={true}
        saturation={0}
        speed={0.2}
      />

      <GLBModel position={[0, -2.5, 0]} rotation={[0, Math.PI / 4, 0]} scale={0.2} />

      {/* Add multiple shooting stars */}
      <ShootingStar startPos={[50, 30, -50]} />
      <ShootingStar startPos={[60, 40, -40]} />
      <ShootingStar startPos={[70, 25, -45]} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate={true}
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
};

export default BackgroundCanvas;
