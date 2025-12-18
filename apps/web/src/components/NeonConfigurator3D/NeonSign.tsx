import { Text3D, Center } from "@react-three/drei";

interface NeonSignProps {
  text: string;
  color: string;
  size: number;
  font: string;
  backboard: string;
}

export default function NeonSign({
  text,
  color,
  size,
  font,
  backboard,
}: NeonSignProps) {
  // Approximate dimensions for Rectangle backboard
  const rectWidth = text.length * size * 0.6 + size;
  const rectHeight = size * 2;

  return (
    <group>
      {/* Main Neon Text */}
      <Center>
        <Text3D
          font={font}
          size={size}
          height={0.1} // Thickness of neon tube
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          {text}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </Text3D>
      </Center>

      {/* Cut-to-Shape Backboard (Acrylic) */}
      {backboard === "cut-to-shape" && (
        <Center position={[0, 0, -0.05]}>
          <Text3D
            font={font}
            size={size}
            height={0.1}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.05} // Thicker for backing
            bevelSize={0.08} // Wider for outline effect
            bevelOffset={0}
            bevelSegments={5}
          >
            {text}
            <meshPhysicalMaterial
              transparent
              opacity={0.3}
              color="white"
              roughness={0.1}
              metalness={0.1}
              transmission={0.6} // Glass-like
              thickness={0.5}
            />
          </Text3D>
        </Center>
      )}

      {/* Rectangle Backboard (Acrylic) */}
      {backboard === "rectangle" && (
        <mesh position={[0, size / 3, -0.1]}>
          <boxGeometry args={[rectWidth, rectHeight, 0.05]} />
          <meshPhysicalMaterial
            transparent
            opacity={0.5}
            color="white"
            roughness={0.2}
            metalness={0.1}
            transmission={0.5}
          />
        </mesh>
      )}
    </group>
  );
}
