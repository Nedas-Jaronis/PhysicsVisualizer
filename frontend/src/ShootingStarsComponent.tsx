import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ShootingStar: React.FC<{ startPos?: [number, number, number] }> = ({
  startPos = [50, 30, -50],
}) => {
  const starRef = useRef<THREE.Line>(null);

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
  const points = [];
  points.push(new THREE.Vector3(0, 0, 0));
  points.push(new THREE.Vector3(3, 1, 0)); // streak length

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: "white", linewidth: 2 });

  return <line ref={starRef} geometry={geometry} material={material} position={startPos} />;
};

export default ShootingStar;
