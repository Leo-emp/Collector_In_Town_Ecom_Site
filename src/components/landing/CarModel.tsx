// CarModel — a single 3D car model viewer with drag-to-rotate
// When a real GLB file URL is provided, it loads the scanned model
// Otherwise shows a stylized placeholder car shape
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import type { Group } from "three";

interface CarModelProps {
  modelUrl?: string; // Optional GLB file URL from Supabase Storage
}

// Placeholder car shape — used when no GLB model is available
// A low-poly stylized car made from basic Three.js geometries
function PlaceholderCar() {
  const groupRef = useRef<Group>(null);

  // Gentle auto-rotation to draw attention
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* Car body — main box */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.8, 0.4, 0.8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Car cabin — top section */}
      <mesh position={[0.1, 0.55, 0]}>
        <boxGeometry args={[1, 0.3, 0.7]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.3} transparent opacity={0.8} />
      </mesh>

      {/* Front wheel left */}
      <mesh position={[-0.55, 0.1, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Front wheel right */}
      <mesh position={[-0.55, 0.1, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Rear wheel left */}
      <mesh position={[0.55, 0.1, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Rear wheel right */}
      <mesh position={[0.55, 0.1, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Headlights — small gold accent spheres */}
      <mesh position={[-0.92, 0.3, 0.25]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#c9a84c" emissive="#c9a84c" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.92, 0.3, -0.25]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#c9a84c" emissive="#c9a84c" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// Real GLB model loader — loads a scanned car model from URL
function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

export function CarModel({ modelUrl }: CarModelProps) {
  return (
    <>
      {/* Lighting setup — dramatic studio lighting for premium feel */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-3, 3, -3]} intensity={0.3} color="#c9a84c" />

      {/* Environment map — adds realistic reflections */}
      <Environment preset="city" />

      {/* Contact shadow — subtle shadow beneath the car */}
      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={0.4}
        scale={3}
        blur={2}
        far={1}
        color="#000000"
      />

      {/* The car model — either real GLB or placeholder */}
      {modelUrl ? <GLBModel url={modelUrl} /> : <PlaceholderCar />}

      {/* Orbit controls — drag to rotate, scroll to zoom */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate={false}
      />
    </>
  );
}
