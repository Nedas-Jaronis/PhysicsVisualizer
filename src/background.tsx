// BackgroundCanvas.tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const BackgroundModel = () => {
  const { scene } = useGLTF("./white_blue.glb"); // Update this path
  return <primitive object={scene} scale={0.3} />;
};

const BackgroundCanvas = () => {
  return (
    <Canvas
      className="background-canvas"
      camera={{ position: [0, 0, 5], fov: 45 }}
    >
      <ambientLight intensity={1} />
      <BackgroundModel />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate={true}
      />
    </Canvas>
  );
};

export default BackgroundCanvas;
