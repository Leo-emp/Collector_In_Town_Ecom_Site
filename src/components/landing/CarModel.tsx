// CarModel — showroom 3D scene: car on metallic pedestal with spotlights
// Fully interactive: zoom, spin, rotate, pan
// Loads real GLB models when available, shows placeholder otherwise
"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Group, Mesh } from "three";

interface CarModelProps {
  modelUrl?: string;
  color?: string;
  onLoaded?: () => void; // callback when model finishes loading
}

// Spotlight beam — visible cone of light from above
function SpotlightBeam({ position, angle = 0.3, color = "#ffffff", opacity = 0.04 }: {
  position: [number, number, number];
  angle?: number;
  color?: string;
  opacity?: number;
}) {
  const height = position[1] + 0.5;
  const bottomRadius = Math.tan(angle) * height;

  return (
    <mesh position={[position[0], position[1] - height / 2, position[2]]}>
      <coneGeometry args={[bottomRadius, height, 32, 1, true]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Metallic turntable pedestal with glowing ring
function Pedestal() {
  const ringRef = useRef<Mesh>(null);

  // Pulse the ring glow
  useFrame((state) => {
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* Main pedestal cylinder */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.3, 1.4, 0.25, 64]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.95} roughness={0.25} />
      </mesh>

      {/* Top surface */}
      <mesh position={[0, 0.23, 0]} receiveShadow>
        <cylinderGeometry args={[1.28, 1.28, 0.02, 64]} />
        <meshStandardMaterial color="#0d0d10" metalness={0.98} roughness={0.1} />
      </mesh>

      {/* Glowing ring */}
      <mesh ref={ringRef} position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.25, 0.015, 16, 100]} />
        <meshStandardMaterial
          color="#4488ff"
          emissive="#4488ff"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      {/* Inner glow ring */}
      <mesh position={[0, 0.245, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.008, 16, 80]} />
        <meshStandardMaterial
          color="#4488ff"
          emissive="#4488ff"
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Pedestal base */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.04, 64]} />
        <meshStandardMaterial color="#111115" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Real GLB model — auto-centers and auto-scales to fit the pedestal
function GLBModel({ url, onLoaded }: { url: string; onLoaded?: () => void }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (scene) {
      // Compute bounding box to auto-scale and center the model
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      // Scale model so its largest dimension fits ~2 units (pedestal diameter)
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 2;
      const scale = targetSize / maxDim;
      scene.scale.setScalar(scale);

      // Recompute after scaling
      box.setFromObject(scene);
      box.getCenter(center);

      // Center horizontally, sit on pedestal top
      scene.position.set(-center.x, -box.min.y - 0.25, -center.z);

      // Enable shadows on all meshes
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      onLoaded?.();
    }
  }, [scene, onLoaded]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

// Showroom scene — assembles lighting, pedestal, model, and controls
export function CarModel({ modelUrl, color, onLoaded }: CarModelProps) {
  return (
    <>
      {/* Dark background matching the page */}
      <color attach="background" args={["#0a0a0c"]} />
      <fog attach="fog" args={["#0a0a0c", 6, 15]} />

      {/* Low ambient fill */}
      <ambientLight intensity={0.1} />

      {/* === SPOTLIGHTS === */}

      {/* Center — main key light from above */}
      <spotLight
        position={[0, 7, 2]}
        angle={0.3}
        penumbra={0.8}
        intensity={50}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <SpotlightBeam position={[0, 7, 2]} angle={0.3} />

      {/* Left gold accent */}
      <spotLight
        position={[-4, 6, 1]}
        angle={0.35}
        penumbra={0.7}
        intensity={25}
        color="#c9a84c"
        castShadow
      />
      <SpotlightBeam position={[-4, 6, 1]} angle={0.35} color="#c9a84c" opacity={0.025} />

      {/* Right blue accent */}
      <spotLight
        position={[4, 6, -1]}
        angle={0.35}
        penumbra={0.7}
        intensity={20}
        color="#4466ff"
        castShadow
      />
      <SpotlightBeam position={[4, 6, -1]} angle={0.35} color="#4466ff" opacity={0.02} />

      {/* Back rim light */}
      <spotLight
        position={[0, 5, -4]}
        angle={0.4}
        penumbra={0.6}
        intensity={15}
        color="#ffffff"
      />

      {/* Pedestal with glowing ring */}
      <Pedestal />

      {/* Reflective showroom floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#080810" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Car model — GLB if available */}
      {modelUrl && <GLBModel url={modelUrl} onLoaded={onLoaded} />}

      {/* Fully interactive orbit controls
          Camera starts at eye-level 3/4 front view (matching reference image) */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1.5}
        maxDistance={6}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.1}
        dampingFactor={0.05}
        enableDamping={true}
        target={[0, 0, 0]}
      />
    </>
  );
}
