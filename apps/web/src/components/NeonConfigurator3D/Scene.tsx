import { useRef, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import NeonPlane from "./NeonPlane";
import NeonLogo, { ProcessingMethod } from "./NeonLogo";

type TextAlign = "left" | "center" | "right";

interface SceneProps {
  text: string;
  color: string;
  size: number;
  fontFamily: string;
  backboard: string;
  borderWidth: number;
  textAlign: TextAlign;
  mode: "text" | "logo";
  // Logo props
  logoUrl?: string;
  logoSize?: number;
  logoOutlineWidth?: number;
  logoProcessingMethod?: ProcessingMethod;
  // Camera control
  onControlsReady?: (resetFn: () => void) => void;
  // Glow controls
  glowIntensity?: number;
  glowSpread?: number;
}

// Default camera position
const DEFAULT_CAMERA_POSITION: [number, number, number] = [0, 0, 15];

// Inner component to access Three.js context
function SceneContent({
  text,
  color,
  size,
  fontFamily,
  backboard,
  borderWidth,
  textAlign,
  mode,
  logoUrl,
  logoSize = 2,
  logoOutlineWidth = 0.5,
  logoProcessingMethod = "original",
  onControlsReady,
  glowIntensity = 1.5,
  glowSpread = 1,
}: SceneProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // Enable damping animation
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  // Register reset function when controls are ready
  const handleControlsChange = useCallback(() => {
    if (controlsRef.current && onControlsReady) {
      onControlsReady(() => {
        if (controlsRef.current) {
          // Reset camera position
          camera.position.set(...DEFAULT_CAMERA_POSITION);
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }
      });
    }
  }, [camera, onControlsReady]);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={DEFAULT_CAMERA_POSITION}
        fov={50}
      />

      {/* Minimal Lighting */}
      <ambientLight intensity={0.3} />
      <Environment preset="night" blur={0.8} />

      {/* Controls - improved for better UX */}
      <OrbitControls
        ref={controlsRef}
        // Enable all interactions
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        // Zoom limits
        minDistance={5}
        maxDistance={50}
        // 1. Damping for smooth, inertial movement
        enableDamping={true}
        dampingFactor={0.05}
        // 2. Reduced rotation speed for finer control
        rotateSpeed={0.5}
        panSpeed={0.5}
        zoomSpeed={0.8}
        // 4. Polar angle limits to prevent flipping upside down
        // Range from 30° to 150° (π/6 to 5π/6)
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={(5 * Math.PI) / 6}
        // Callback when mounted
        onEnd={handleControlsChange}
      />

      {/* Neon Text - only in text mode */}
      {mode === "text" && (
        <NeonPlane
          text={text}
          color={color}
          size={size}
          fontFamily={fontFamily}
          backboard={backboard}
          borderWidth={borderWidth}
          textAlign={textAlign}
        />
      )}

      {/* Neon Logo - only in logo mode when logo is uploaded */}
      {mode === "logo" && logoUrl && (
        <NeonLogo
          imageUrl={logoUrl}
          color={color}
          size={logoSize}
          outlineWidth={logoOutlineWidth}
          processingMethod={logoProcessingMethod}
        />
      )}

      {/* Post Processing - Enhanced bloom for neon glow */}
      <EffectComposer enableNormalPass={false}>
        <Bloom
          key={`bloom-${glowIntensity}-${glowSpread}`}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.95}
          mipmapBlur={true}
          levels={5}
          radius={glowSpread}
          intensity={glowIntensity * 1.2}
        />
      </EffectComposer>
    </>
  );
}

export default function Scene(props: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        preserveDrawingBuffer: true,
        antialias: true,
        alpha: true,
      }}
      style={{ background: "transparent" }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
