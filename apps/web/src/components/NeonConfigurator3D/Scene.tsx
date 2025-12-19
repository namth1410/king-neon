import { Canvas } from "@react-three/fiber";
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
}

export default function Scene({
  text,
  color,
  size,
  fontFamily,
  backboard,
  borderWidth,
  textAlign,
  mode,
  // Logo props with defaults
  logoUrl,
  logoSize = 2,
  logoOutlineWidth = 0.5,
  logoProcessingMethod = "alpha",
}: SceneProps) {
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
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />

      {/* Minimal Lighting */}
      <ambientLight intensity={0.3} />
      <Environment preset="night" blur={0.8} />

      {/* Controls - allows full 3D rotation of the neon sign */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
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
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          height={400}
          intensity={1.5}
        />
      </EffectComposer>
    </Canvas>
  );
}
