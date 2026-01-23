import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ShootingStar: React.FC<{ startPos?: [number, number, number] }> = ({
  startPos = [50, 30, -50],
}) => {
  const starRef = useRef<THREE.Group>(null);

  // Velocity of shooting star
  const velocity = new THREE.Vector3(-0.3, -0.1, 0);

  // Reset position when out of view
  useFrame(() => {
    if (!starRef.current) return;

    starRef.current.position.add(velocity);

    if (starRef.current.position.x < -50 || starRef.current.position.y < -50) {
      starRef.current.position.set(...startPos);
    }
  });

  // Geometry for shooting star streak
  const lineGeometry = useMemo(() => {
    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(3, 1, 0)); // streak length
    return new Float32Array(points.flatMap(p => [p.x, p.y, p.z]));
  }, []);

  return (
    <group ref={starRef} position={startPos}>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lineGeometry, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="white" linewidth={2} />
      </line>
    </group>
  );
};

export default ShootingStar;
