import { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import NeonSign from "./NeonSign";

interface SceneProps {
  text: string;
  color: string;
  font: string;
  size: number;
  backboard: string;
  cameraDistance: number;
}

function CameraController({ distance }: { distance: number }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.z = distance;
    camera.updateProjectionMatrix();
  }, [distance, camera]);

  return null;
}

export default function Scene({
  text,
  color,
  font,
  size,
  backboard,
  cameraDistance,
}: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
      <CameraController distance={cameraDistance} />

      {/* Lighting & Environment */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Environment preset="night" background blur={0.5} />

      {/* Controls */}
      <OrbitControls
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        minDistance={2}
        maxDistance={100}
      />

      {/* Neon Sign Object & Backboard */}
      <group position={[0, 0, 0]}>
        <NeonSign
          text={text}
          color={color}
          size={size}
          font={font}
          backboard={backboard}
        />
      </group>

      {/* Post Processing Effects */}
      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
          height={300}
          opacity={1.5}
          intensity={2}
        />
      </EffectComposer>
    </Canvas>
  );
}
