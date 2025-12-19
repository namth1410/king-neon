import { useRef, useEffect, useMemo, useState } from "react";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

export type ProcessingMethod = "original" | "outline";

interface NeonLogoProps {
  imageUrl: string;
  color: string;
  size: number;
  outlineWidth: number;
  processingMethod: ProcessingMethod;
}

// Mode 1: Keep original colors with neon glow around it
function createOriginalGlowCanvas(
  image: HTMLImageElement,
  color: string,
  outlineWidth: number
): HTMLCanvasElement {
  const scale = 2;
  const padding = outlineWidth * 20 * scale;
  const imgWidth = image.width * scale;
  const imgHeight = image.height * scale;

  const canvas = document.createElement("canvas");
  canvas.width = imgWidth + padding * 2;
  canvas.height = imgHeight + padding * 2;
  const ctx = canvas.getContext("2d")!;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const centerX = padding;
  const centerY = padding;

  // Draw glow layers behind the image
  for (let i = 5; i >= 1; i--) {
    ctx.save();
    ctx.globalAlpha = 0.2 / i;
    ctx.shadowColor = color;
    ctx.shadowBlur = outlineWidth * i * 8 * scale;
    ctx.drawImage(image, centerX, centerY, imgWidth, imgHeight);
    ctx.restore();
  }

  // Draw original image on top
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.shadowColor = color;
  ctx.shadowBlur = outlineWidth * 3 * scale;
  ctx.drawImage(image, centerX, centerY, imgWidth, imgHeight);
  ctx.restore();

  return canvas;
}

// Mode 2: Extract outline only with neon effect
function createOutlineCanvas(
  image: HTMLImageElement,
  color: string,
  outlineWidth: number
): HTMLCanvasElement {
  const scale = 2;
  const padding = outlineWidth * 30 * scale;
  const imgWidth = image.width * scale;
  const imgHeight = image.height * scale;

  const canvas = document.createElement("canvas");
  canvas.width = imgWidth + padding * 2;
  canvas.height = imgHeight + padding * 2;
  const ctx = canvas.getContext("2d")!;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const centerX = padding;
  const centerY = padding;

  // Create outline by drawing stroke around the shape
  // Step 1: Create a mask canvas with the image
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  const maskCtx = maskCanvas.getContext("2d")!;
  maskCtx.imageSmoothingEnabled = true;
  maskCtx.imageSmoothingQuality = "high";

  // Draw thick colored version (outer)
  const strokeSize = outlineWidth * 3 * scale;

  // Draw the image multiple times with offset to create outline
  maskCtx.globalCompositeOperation = "source-over";
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
    const dx = Math.cos(angle) * strokeSize;
    const dy = Math.sin(angle) * strokeSize;
    maskCtx.drawImage(image, centerX + dx, centerY + dy, imgWidth, imgHeight);
  }

  // Cut out the center to leave only outline
  maskCtx.globalCompositeOperation = "destination-out";
  maskCtx.drawImage(image, centerX, centerY, imgWidth, imgHeight);

  // Now apply neon glow to the outline
  // Outer glow
  for (let i = 5; i >= 1; i--) {
    ctx.save();
    ctx.globalAlpha = 0.25 / i;
    ctx.shadowColor = color;
    ctx.shadowBlur = outlineWidth * i * 10 * scale;
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.restore();
  }

  // Core glow
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.shadowColor = color;
  ctx.shadowBlur = outlineWidth * 5 * scale;
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.restore();

  // Tint the outline with the neon color
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  // Add white core for brightness
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = outlineWidth * 2 * scale;
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.restore();

  return canvas;
}

export default function NeonLogo({
  imageUrl,
  color,
  size,
  outlineWidth,
  processingMethod,
}: NeonLogoProps) {
  const meshRef = useRef<THREE.Group>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setLoadedImage(img);
    img.src = imageUrl;
  }, [imageUrl]);

  // Process image and create texture
  const { texture, aspectRatio } = useMemo(() => {
    if (!loadedImage) {
      return { texture: null, aspectRatio: 1 };
    }

    // Create neon effect canvas based on method
    const neonCanvas =
      processingMethod === "outline"
        ? createOutlineCanvas(loadedImage, color, outlineWidth)
        : createOriginalGlowCanvas(loadedImage, color, outlineWidth);

    const tex = new THREE.CanvasTexture(neonCanvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = tex;

    return {
      texture: tex,
      aspectRatio: neonCanvas.width / neonCanvas.height,
    };
  }, [loadedImage, color, outlineWidth, processingMethod]);

  // Handle drag
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

  const handlePointerUp = () => setIsDragging(false);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && e.point) {
      setPosition([
        e.point.x - dragOffset.current.x,
        e.point.y - dragOffset.current.y,
        0,
      ]);
    }
  };

  if (!texture) return null;

  const planeWidth = size * aspectRatio * 2;
  const planeHeight = size * 2;

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerUp}
    >
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
