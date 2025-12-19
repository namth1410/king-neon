import { useRef, useEffect, useState, useMemo } from "react";
import { Text3D, Center, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

interface NeonSignProps {
  text: string;
  color: string;
  size: number;
  font: string;
  backboard: string;
}

// Component to measure text bounds and render backboard
function TextWithBackboard({
  text,
  color,
  size,
  font,
  backboard,
}: NeonSignProps) {
  const textRef = useRef<THREE.Mesh>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });

  // Measure text bounds after render
  useEffect(() => {
    if (textRef.current) {
      const box = new THREE.Box3().setFromObject(textRef.current);
      const textSize = new THREE.Vector3();
      box.getSize(textSize);
      setBounds({ width: textSize.x, height: textSize.y });
    }
  }, [text, size, font]);

  // Calculate backboard dimensions - tighter fit for cut-to-shape look
  const backboardDimensions = useMemo(() => {
    const paddingX = size * 0.3;
    const paddingY = size * 0.35;
    const width = bounds.width + paddingX * 2;
    const height = bounds.height + paddingY * 2;
    return { width, height };
  }, [bounds, size]);

  // Create glow color from neon color
  const glowColor = useMemo(() => {
    const col = new THREE.Color(color);
    col.multiplyScalar(0.5); // Dimmer for background glow
    return col;
  }, [color]);

  return (
    <group>
      {/* Cut-to-Shape Backboard - Soft glow halo using RoundedBox */}
      {backboard === "cut-to-shape" && bounds.width > 0 && (
        <Center position={[0, 0, -0.1]}>
          <RoundedBox
            args={[backboardDimensions.width, backboardDimensions.height, 0.06]}
            radius={size * 0.15} // Rounded corners proportional to text size
            smoothness={8}
          >
            <meshStandardMaterial
              color={glowColor}
              emissive={glowColor}
              emissiveIntensity={1.2}
              transparent
              opacity={0.6}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </RoundedBox>
        </Center>
      )}

      {/* Main Neon Text */}
      <Center>
        <Text3D
          ref={textRef}
          font={font}
          size={size}
          height={0.15}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.03}
          bevelOffset={0}
          bevelSegments={5}
        >
          {text}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={3}
            toneMapped={false}
          />
        </Text3D>
      </Center>

      {/* Rectangle Backboard - Acrylic transparent look */}
      {backboard === "rectangle" && bounds.width > 0 && (
        <Center position={[0, 0, -0.15]}>
          <RoundedBox
            args={[
              backboardDimensions.width + size * 0.5,
              backboardDimensions.height + size * 0.3,
              0.08,
            ]}
            radius={0.15}
            smoothness={4}
          >
            <meshPhysicalMaterial
              transparent
              opacity={0.4}
              color="#ffffff"
              roughness={0.1}
              metalness={0.05}
              transmission={0.7}
              thickness={0.5}
              clearcoat={0.5}
              clearcoatRoughness={0.1}
            />
          </RoundedBox>
        </Center>
      )}
    </group>
  );
}

export default function NeonSign(props: NeonSignProps) {
  return <TextWithBackboard {...props} />;
}
