import React from "react";
import { useGLTF } from "@react-three/drei";

interface GLBModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

const GLBModel: React.FC<GLBModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.1,
}) => {
  const { scene } = useGLTF("./white_blue.glb");
  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
};

export default GLBModel;
