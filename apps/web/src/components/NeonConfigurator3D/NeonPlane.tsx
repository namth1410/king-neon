import { useRef, useEffect, useMemo, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

type TextAlign = "left" | "center" | "right";

interface NeonPlaneProps {
  text: string;
  color: string;
  size: number;
  fontFamily: string;
  backboard: string;
  borderWidth: number;
  textAlign: TextAlign;
}

// Rainbow colors for gradient animation
const rainbowColors = [
  "#ff0000",
  "#ff8800",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#0088ff",
  "#8800ff",
  "#ff00ff",
];

// Get rainbow color based on time
function getRainbowColor(time: number): string {
  const index = Math.floor((time * 0.5) % rainbowColors.length);
  const nextIndex = (index + 1) % rainbowColors.length;
  const t = (time * 0.5) % 1;

  // Simple color interpolation
  const c1 = parseInt(rainbowColors[index].slice(1), 16);
  const c2 = parseInt(rainbowColors[nextIndex].slice(1), 16);

  const r1 = (c1 >> 16) & 255,
    g1 = (c1 >> 8) & 255,
    b1 = c1 & 255;
  const r2 = (c2 >> 16) & 255,
    g2 = (c2 >> 8) & 255,
    b2 = c2 & 255;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Create neon text on canvas with glow effect - supports multiline and alignment
function createNeonCanvas(
  text: string,
  color: string,
  fontSize: number,
  fontFamily: string,
  backboard: string,
  borderWidth: number,
  textAlign: TextAlign
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Split text into lines
  const lines = text.split("\n");
  const lineHeight = fontSize * 1.2;

  // Set font for measurement
  ctx.font = `bold ${fontSize}px ${fontFamily}`;

  // Measure max line width
  let maxWidth = 0;
  for (const line of lines) {
    const metrics = ctx.measureText(line);
    maxWidth = Math.max(maxWidth, metrics.width);
  }

  const totalHeight = lineHeight * lines.length;

  // Add padding for glow
  const padding = fontSize * 0.8;
  canvas.width = maxWidth + padding * 2;
  canvas.height = totalHeight + padding * 2;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Reset font after resize
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "middle";

  // Set text alignment
  let alignX: number;
  if (textAlign === "left") {
    ctx.textAlign = "left";
    alignX = padding;
  } else if (textAlign === "right") {
    ctx.textAlign = "right";
    alignX = canvas.width - padding;
  } else {
    ctx.textAlign = "center";
    alignX = canvas.width / 2;
  }

  // Draw each line
  const drawText = (
    fillColor: string,
    shadowColor: string,
    shadowBlur: number,
    alpha = 1
  ) => {
    ctx.globalAlpha = alpha;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
    ctx.fillStyle = fillColor;

    for (let i = 0; i < lines.length; i++) {
      const y = padding + lineHeight * 0.5 + i * lineHeight;
      ctx.fillText(lines[i], alignX, y);
    }
    ctx.globalAlpha = 1;
  };

  // Draw backboard if cut-to-shape - creates realistic acrylic backing like the reference
  if (backboard === "cut-to-shape") {
    // borderWidth controls the thickness of acrylic outline (scaled by fontSize)
    const strokeWidth = borderWidth * fontSize * 0.5;

    // Create offscreen canvas for merged acrylic shape
    const offCanvas = document.createElement("canvas");
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    const offCtx = offCanvas.getContext("2d")!;

    // Copy font settings
    offCtx.font = ctx.font;
    offCtx.textAlign = ctx.textAlign as CanvasTextAlign;
    offCtx.textBaseline = ctx.textBaseline as CanvasTextBaseline;

    // Set stroke properties for merged acrylic outline
    offCtx.lineWidth = strokeWidth;
    offCtx.lineJoin = "round";
    offCtx.lineCap = "round";

    // Draw all text strokes first (they will merge naturally)
    // Layer 1: Outer stroke (main acrylic body)
    offCtx.strokeStyle = "rgba(180, 180, 200, 1)";
    offCtx.fillStyle = "rgba(200, 200, 220, 1)";
    for (let i = 0; i < lines.length; i++) {
      const y = padding + lineHeight * 0.5 + i * lineHeight;
      offCtx.strokeText(lines[i], alignX, y);
      offCtx.fillText(lines[i], alignX, y);
    }

    // Layer 2: Inner stroke
    offCtx.lineWidth = strokeWidth * 0.7;
    offCtx.strokeStyle = "rgba(220, 220, 240, 1)";
    for (let i = 0; i < lines.length; i++) {
      const y = padding + lineHeight * 0.5 + i * lineHeight;
      offCtx.strokeText(lines[i], alignX, y);
    }

    // Layer 3: Inner highlight stroke
    offCtx.lineWidth = strokeWidth * 0.35;
    offCtx.strokeStyle = "rgba(255, 255, 255, 1)";
    for (let i = 0; i < lines.length; i++) {
      const y = padding + lineHeight * 0.5 + i * lineHeight;
      offCtx.strokeText(lines[i], alignX, y);
    }

    // Draw the merged offscreen canvas onto main canvas with transparency
    ctx.save();
    ctx.globalAlpha = 0.35; // Make it semi-transparent like real acrylic
    ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
    ctx.shadowBlur = strokeWidth * 0.2;
    ctx.drawImage(offCanvas, 0, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Draw main neon text with glow
  // Outer glow layers
  for (let i = 4; i >= 1; i--) {
    drawText(color, color, fontSize * 0.08 * i);
  }

  // Inner bright core
  drawText("#ffffff", "#ffffff", fontSize * 0.05, 0.8);

  // Final text layer
  drawText(color, color, fontSize * 0.1);

  return canvas;
}

export default function NeonPlane({
  text,
  color,
  size,
  fontFamily,
  backboard,
  borderWidth,
  textAlign,
}: NeonPlaneProps) {
  const meshRef = useRef<THREE.Group>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const [currentColor, setCurrentColor] = useState(color);
  const isRainbow = color === "rainbow";

  // Handle rainbow color animation only
  useFrame((state) => {
    // Update rainbow color
    if (isRainbow) {
      const newColor = getRainbowColor(state.clock.elapsedTime);
      if (newColor !== currentColor) {
        setCurrentColor(newColor);
      }
    }
  });

  // Update currentColor when color prop changes (non-rainbow)
  useEffect(() => {
    if (!isRainbow) {
      setCurrentColor(color);
    }
  }, [color, isRainbow]);

  // Create and update canvas texture
  const { texture, aspectRatio } = useMemo(() => {
    const fontSize = 200; // High resolution for quality
    const canvas = createNeonCanvas(
      text,
      currentColor,
      fontSize,
      fontFamily,
      backboard,
      borderWidth,
      textAlign
    );

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;

    textureRef.current = tex;

    return {
      texture: tex,
      aspectRatio: canvas.width / canvas.height,
    };
  }, [text, currentColor, fontFamily, backboard, borderWidth, textAlign]);

  // Update texture when props change
  useEffect(() => {
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  }, [text, currentColor, fontFamily, backboard, textAlign]);

  // Calculate plane dimensions based on size and aspect ratio
  const planeWidth = size * aspectRatio * 2;
  const planeHeight = size * 2;

  // Backboard dimensions with padding
  const backboardWidth = planeWidth + size * 0.4;
  const backboardHeight = planeHeight + size * 0.4;

  // Dragging state
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Handle drag using ThreeEvent
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
    // Store offset from click point to current position
    if (e.point) {
      dragOffset.current = {
        x: e.point.x - position[0],
        y: e.point.y - position[1],
      };
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && e.point) {
      // Apply offset to get smooth drag
      setPosition([
        e.point.x - dragOffset.current.x,
        e.point.y - dragOffset.current.y,
        0,
      ]);
    }
  };

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerUp}
    >
      {/* Rectangle Acrylic Backboard - only for rectangle mode */}
      {backboard === "rectangle" && (
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[backboardWidth, backboardHeight, 0.08]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
            roughness={0.1}
            metalness={0}
            transmission={0.75}
            thickness={0.5}
            clearcoat={0.5}
            clearcoatRoughness={0.1}
            envMapIntensity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Neon Text Plane */}
      <mesh>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial
          map={texture}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
