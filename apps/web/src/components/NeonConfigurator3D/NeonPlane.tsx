import { useRef, useEffect, useMemo, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { StyledChar, TextAlign, splitStyledCharsIntoLines } from "./types";

interface NeonPlaneProps {
  styledChars: StyledChar[];
  size: number;
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

// Create neon text on canvas with glow effect - supports per-character styling
function createNeonCanvas(
  styledChars: StyledChar[],
  fontSize: number,
  backboard: string,
  borderWidth: number,
  textAlign: TextAlign,
  rainbowColor: string
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Split into lines
  const lines = splitStyledCharsIntoLines(styledChars);
  const lineHeight = fontSize * 1.2;

  // Measure max line width (with each character's own font)
  let maxWidth = 0;
  for (const line of lines) {
    let lineWidth = 0;
    for (const styledChar of line) {
      ctx.font = `bold ${fontSize}px ${styledChar.fontFamily}`;
      lineWidth += ctx.measureText(styledChar.char).width;
    }
    maxWidth = Math.max(maxWidth, lineWidth);
  }

  const totalHeight = lineHeight * Math.max(lines.length, 1);

  // Add padding for glow - ensure minimum dimensions
  const padding = fontSize * 0.8;
  canvas.width = Math.max(maxWidth + padding * 2, padding * 4);
  canvas.height = Math.max(totalHeight + padding * 2, padding * 4);

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw backboard if cut-to-shape
  if (backboard === "cut-to-shape") {
    drawCutToShapeBackboard(
      ctx,
      lines,
      fontSize,
      lineHeight,
      borderWidth,
      padding,
      textAlign,
      canvas.width
    );
  }

  // Draw each line of characters
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const y = padding + lineHeight * 0.5 + lineIndex * lineHeight;

    // Calculate line width for alignment
    let lineWidth = 0;
    for (const styledChar of line) {
      ctx.font = `bold ${fontSize}px ${styledChar.fontFamily}`;
      lineWidth += ctx.measureText(styledChar.char).width;
    }

    // Calculate starting X based on alignment
    let x: number;
    if (textAlign === "left") {
      x = padding;
    } else if (textAlign === "right") {
      x = canvas.width - padding - lineWidth;
    } else {
      x = (canvas.width - lineWidth) / 2;
    }

    // Draw each character
    for (const styledChar of line) {
      const color =
        styledChar.color === "rainbow" ? rainbowColor : styledChar.color;
      ctx.font = `bold ${fontSize}px ${styledChar.fontFamily}`;
      const charWidth = ctx.measureText(styledChar.char).width;

      // Draw neon glow layers
      drawNeonCharacter(ctx, styledChar.char, x, y, color, fontSize);

      x += charWidth;
    }
  }

  return canvas;
}

// Draw a single character with neon glow effect
function drawNeonCharacter(
  ctx: CanvasRenderingContext2D,
  char: string,
  x: number,
  y: number,
  color: string,
  fontSize: number
) {
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // Outer glow layers
  for (let i = 4; i >= 1; i--) {
    ctx.globalAlpha = 1;
    ctx.shadowColor = color;
    ctx.shadowBlur = fontSize * 0.08 * i;
    ctx.fillStyle = color;
    ctx.fillText(char, x, y);
  }

  // Inner bright core
  ctx.globalAlpha = 0.8;
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = fontSize * 0.05;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(char, x, y);

  // Final text layer
  ctx.globalAlpha = 1;
  ctx.shadowColor = color;
  ctx.shadowBlur = fontSize * 0.1;
  ctx.fillStyle = color;
  ctx.fillText(char, x, y);

  // Reset
  ctx.globalAlpha = 1;
}

// Draw cut-to-shape backboard behind text
function drawCutToShapeBackboard(
  ctx: CanvasRenderingContext2D,
  lines: StyledChar[][],
  fontSize: number,
  lineHeight: number,
  borderWidth: number,
  padding: number,
  textAlign: TextAlign,
  canvasWidth: number
) {
  const strokeWidth = borderWidth * fontSize * 0.5;

  // Create offscreen canvas for merged acrylic shape
  const offCanvas = document.createElement("canvas");
  offCanvas.width = ctx.canvas.width;
  offCanvas.height = ctx.canvas.height;
  const offCtx = offCanvas.getContext("2d")!;

  offCtx.lineWidth = strokeWidth;
  offCtx.lineJoin = "round";
  offCtx.lineCap = "round";

  // Draw each line
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const y = padding + lineHeight * 0.5 + lineIndex * lineHeight;

    // Calculate line width for alignment
    let lineWidth = 0;
    for (const styledChar of line) {
      offCtx.font = `bold ${fontSize}px ${styledChar.fontFamily}`;
      lineWidth += offCtx.measureText(styledChar.char).width;
    }

    // Calculate starting X based on alignment
    let x: number;
    if (textAlign === "left") {
      x = padding;
    } else if (textAlign === "right") {
      x = canvasWidth - padding - lineWidth;
    } else {
      x = (canvasWidth - lineWidth) / 2;
    }

    // Draw backboard for each character
    for (const styledChar of line) {
      offCtx.font = `bold ${fontSize}px ${styledChar.fontFamily}`;
      offCtx.textAlign = "left";
      offCtx.textBaseline = "middle";
      const charWidth = offCtx.measureText(styledChar.char).width;

      // Layer 1: Outer stroke
      offCtx.strokeStyle = "rgba(180, 180, 200, 1)";
      offCtx.fillStyle = "rgba(200, 200, 220, 1)";
      offCtx.lineWidth = strokeWidth;
      offCtx.strokeText(styledChar.char, x, y);
      offCtx.fillText(styledChar.char, x, y);

      // Layer 2: Inner stroke
      offCtx.lineWidth = strokeWidth * 0.7;
      offCtx.strokeStyle = "rgba(220, 220, 240, 1)";
      offCtx.strokeText(styledChar.char, x, y);

      // Layer 3: Inner highlight
      offCtx.lineWidth = strokeWidth * 0.35;
      offCtx.strokeStyle = "rgba(255, 255, 255, 1)";
      offCtx.strokeText(styledChar.char, x, y);

      x += charWidth;
    }
  }

  // Draw the merged offscreen canvas onto main canvas
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
  ctx.shadowBlur = strokeWidth * 0.2;
  ctx.drawImage(offCanvas, 0, 0);
  ctx.restore();
  ctx.globalAlpha = 1;
}

export default function NeonPlane({
  styledChars,
  size,
  backboard,
  borderWidth,
  textAlign,
}: NeonPlaneProps) {
  const meshRef = useRef<THREE.Group>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we only create canvas on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [rainbowColor, setRainbowColor] = useState("#ff00ff");

  // Check if any character uses rainbow color
  const hasRainbow = useMemo(
    () => styledChars.some((c) => c.color === "rainbow"),
    [styledChars]
  );

  // Handle rainbow color animation
  useFrame((state) => {
    if (hasRainbow) {
      const newColor = getRainbowColor(state.clock.elapsedTime);
      if (newColor !== rainbowColor) {
        setRainbowColor(newColor);
      }
    }
  });

  // Create and update canvas texture (only on client)
  const { texture, aspectRatio } = useMemo(() => {
    // Return placeholder values during SSR
    if (!isMounted || typeof document === "undefined") {
      return { texture: null, aspectRatio: 1 };
    }

    const fontSize = 200; // High resolution for quality
    const canvas = createNeonCanvas(
      styledChars,
      fontSize,
      backboard,
      borderWidth,
      textAlign,
      rainbowColor
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
  }, [styledChars, backboard, borderWidth, textAlign, rainbowColor, isMounted]);

  // Update texture when props change
  useEffect(() => {
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  }, [styledChars, backboard, textAlign, rainbowColor]);

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

      {/* Neon Text Plane - only render when texture is ready */}
      {texture && (
        <mesh>
          <planeGeometry args={[planeWidth, planeHeight]} />
          <meshBasicMaterial
            map={texture}
            transparent
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}
