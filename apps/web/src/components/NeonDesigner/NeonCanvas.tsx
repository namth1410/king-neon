"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";

interface NeonCanvasProps {
  text: string;
  fontFamily: string;
  color: string;
  backboardType: "cut-to-shape" | "rectangle" | "none";
  backboardColor: string;
  backgroundImageUrl?: string;
  enhancedGlow?: boolean;
  rainbowMode?: boolean;
  glowOpacity?: number; // 0.1 to 2.0
  glowSpread?: number; // 0.5 to 3.0
  width?: number;
  height?: number;
}

export interface NeonCanvasRef {
  exportAsImage: () => string | null;
}

const NeonCanvas = forwardRef<NeonCanvasRef, NeonCanvasProps>(
  (
    {
      text,
      fontFamily,
      color,
      backboardType,
      backboardColor,
      backgroundImageUrl,
      enhancedGlow = false,
      rainbowMode = false,
      glowOpacity = 1,
      glowSpread = 1,
      width = 600,
      height = 300,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const glowPhaseRef = useRef(0);
    const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

    // Load background image when URL changes
    useEffect(() => {
      if (backgroundImageUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => setBgImage(img);
        img.onerror = () => setBgImage(null);
        img.src = backgroundImageUrl;
      } else {
        setBgImage(null);
      }
    }, [backgroundImageUrl]);

    // Parse color to RGB for glow effects
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return { r: 255, g: 51, b: 102 };
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      };
    };

    const drawNeon = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const displayWidth = width;
      const displayHeight = height;

      // Set canvas size with DPR
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      ctx.scale(dpr, dpr);

      // Clear canvas
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // Draw background
      if (bgImage) {
        // Draw background image covering the entire canvas
        const imgRatio = bgImage.width / bgImage.height;
        const canvasRatio = displayWidth / displayHeight;
        let drawWidth, drawHeight, drawX, drawY;

        if (imgRatio > canvasRatio) {
          drawHeight = displayHeight;
          drawWidth = bgImage.width * (displayHeight / bgImage.height);
          drawX = (displayWidth - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = displayWidth;
          drawHeight = bgImage.height * (displayWidth / bgImage.width);
          drawX = 0;
          drawY = (displayHeight - drawHeight) / 2;
        }

        ctx.drawImage(bgImage, drawX, drawY, drawWidth, drawHeight);

        // Add slight dark overlay for better neon visibility
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(0, 0, displayWidth, displayHeight);
      } else {
        // Default dark background
        ctx.fillStyle = "#0a0a0f";
        ctx.fillRect(0, 0, displayWidth, displayHeight);
      }

      // Split text into lines
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length === 0) {
        lines.push("Your Text");
      }

      // Calculate font size based on canvas and text length
      const maxLineLength = Math.max(...lines.map((l) => l.length), 1);
      const baseFontSize = Math.min(
        ((displayWidth * 0.8) / maxLineLength) * 1.5,
        displayHeight / (lines.length + 1)
      );
      const fontSize = Math.max(24, Math.min(baseFontSize, 80));

      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Calculate text dimensions for backboard
      const lineHeight = fontSize * 1.3;
      const textHeight = lines.length * lineHeight;
      const maxWidth = Math.max(
        ...lines.map((line) => ctx.measureText(line).width)
      );

      const centerX = displayWidth / 2;
      const centerY = displayHeight / 2;
      const padding = 30;

      // Draw backboard
      if (backboardType !== "none") {
        ctx.save();

        if (backboardType === "rectangle") {
          // Rectangle backboard
          const rectWidth = maxWidth + padding * 2;
          const rectHeight = textHeight + padding * 2;

          ctx.fillStyle =
            backboardColor === "transparent"
              ? "rgba(30, 30, 40, 0.8)"
              : backboardColor;
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          ctx.shadowBlur = 20;
          ctx.shadowOffsetY = 5;

          // Rounded rectangle
          const radius = 12;
          ctx.beginPath();
          ctx.moveTo(
            centerX - rectWidth / 2 + radius,
            centerY - rectHeight / 2
          );
          ctx.lineTo(
            centerX + rectWidth / 2 - radius,
            centerY - rectHeight / 2
          );
          ctx.quadraticCurveTo(
            centerX + rectWidth / 2,
            centerY - rectHeight / 2,
            centerX + rectWidth / 2,
            centerY - rectHeight / 2 + radius
          );
          ctx.lineTo(
            centerX + rectWidth / 2,
            centerY + rectHeight / 2 - radius
          );
          ctx.quadraticCurveTo(
            centerX + rectWidth / 2,
            centerY + rectHeight / 2,
            centerX + rectWidth / 2 - radius,
            centerY + rectHeight / 2
          );
          ctx.lineTo(
            centerX - rectWidth / 2 + radius,
            centerY + rectHeight / 2
          );
          ctx.quadraticCurveTo(
            centerX - rectWidth / 2,
            centerY + rectHeight / 2,
            centerX - rectWidth / 2,
            centerY + rectHeight / 2 - radius
          );
          ctx.lineTo(
            centerX - rectWidth / 2,
            centerY - rectHeight / 2 + radius
          );
          ctx.quadraticCurveTo(
            centerX - rectWidth / 2,
            centerY - rectHeight / 2,
            centerX - rectWidth / 2 + radius,
            centerY - rectHeight / 2
          );
          ctx.closePath();
          ctx.fill();
        } else {
          // Cut to shape - just a subtle background following text
          ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
          ctx.shadowBlur = 15;
        }

        ctx.restore();
      }

      const getRainbowColor = (phase: number) => {
        const hue = (phase * 50) % 360;
        const s = 1; // Saturation 100%
        const l = 0.5; // Lightness 50%

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
        const m = l - c / 2;
        let r = 0,
          g = 0,
          b = 0;

        if (0 <= hue && hue < 60) {
          r = c;
          g = x;
          b = 0;
        } else if (60 <= hue && hue < 120) {
          r = x;
          g = c;
          b = 0;
        } else if (120 <= hue && hue < 180) {
          r = 0;
          g = c;
          b = x;
        } else if (180 <= hue && hue < 240) {
          r = 0;
          g = x;
          b = c;
        } else if (240 <= hue && hue < 300) {
          r = x;
          g = 0;
          b = c;
        } else if (300 <= hue && hue < 360) {
          r = c;
          g = 0;
          b = x;
        }

        return {
          r: Math.round((r + m) * 255),
          g: Math.round((g + m) * 255),
          b: Math.round((b + m) * 255),
        };
      };

      const rgb = rainbowMode
        ? getRainbowColor(glowPhaseRef.current)
        : hexToRgb(color);

      // Animate glow intensity
      const glowIntensity = 0.85 + Math.sin(glowPhaseRef.current) * 0.15;

      // Draw neon text with multiple glow layers
      lines.forEach((line, index) => {
        const y = centerY - textHeight / 2 + (index + 0.5) * lineHeight;

        // Enhanced glow when enabled (stronger effect for backgrounds)
        const glowLayers = enhancedGlow
          ? [
              {
                blur: 150 * glowSpread,
                alpha: 0.5 * glowIntensity * glowOpacity,
              }, // Super Atmosphere
              {
                blur: 100 * glowSpread,
                alpha: 0.8 * glowIntensity * glowOpacity,
              }, // Strong Aura
              {
                blur: 60 * glowSpread,
                alpha: 1.0 * glowIntensity * glowOpacity,
              }, // Mid Glow
              {
                blur: 30 * glowSpread,
                alpha: 1.2 * glowIntensity * glowOpacity,
              }, // Inner Glow
              {
                blur: 10 * glowSpread,
                alpha: 1.5 * glowIntensity * glowOpacity,
              }, // Core Glow
            ]
          : [
              { blur: 40, alpha: 0.15 * glowIntensity },
              { blur: 25, alpha: 0.25 * glowIntensity },
              { blur: 15, alpha: 0.4 * glowIntensity },
              { blur: 8, alpha: 0.6 * glowIntensity },
              { blur: 4, alpha: 0.8 * glowIntensity },
            ];

        // Draw glow layers
        glowLayers.forEach((layer) => {
          ctx.save();
          if (enhancedGlow) {
            // Additive blending for true neon light effect
            ctx.globalCompositeOperation = "lighter";
          }
          ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${layer.alpha})`;
          ctx.shadowBlur = layer.blur;

          // Use low opacity color fill instead of transparent to ensure shadow is cast
          // and to pile up additively
          ctx.fillStyle = enhancedGlow
            ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`
            : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;

          // Thicken glow source
          if (enhancedGlow) {
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
            ctx.lineWidth = 6;
            ctx.lineJoin = "round";
            ctx.strokeText(line, centerX, y);
          }

          ctx.fillText(line, centerX, y);

          // Second pass for intensity
          if (enhancedGlow) {
            ctx.fillText(line, centerX, y);
            if (layer.blur > 60) ctx.fillText(line, centerX, y);
          }
          ctx.restore();
        });

        // Draw white core (The Tube)
        ctx.save();
        ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
        ctx.shadowBlur = enhancedGlow ? 15 * glowSpread : 2;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4; // Thicker white core tube
        ctx.lineJoin = "round";

        ctx.strokeText(line, centerX, y); // Solid tube stroke
        ctx.fillText(line, centerX, y);

        // Second hot white core for extra brightness in enhanced mode
        if (enhancedGlow) {
          ctx.shadowBlur = 4;
          ctx.fillText(line, centerX, y);
        }
        ctx.restore();
      });

      // Draw dimension indicator
      ctx.save();
      ctx.font = "12px Inter, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      const dimText = `${Math.round(maxWidth)}px × ${Math.round(textHeight)}px`;
      ctx.fillText(dimText, displayWidth - 10, displayHeight - 10);
      ctx.restore();
    }, [
      text,
      fontFamily,
      color,
      backboardType,
      backboardColor,
      bgImage,
      enhancedGlow,
      rainbowMode,
      glowOpacity,
      glowSpread,
      width,
      height,
    ]);

    // Animation loop
    useEffect(() => {
      let lastTime = 0;

      const animate = (time: number) => {
        if (time - lastTime > 50) {
          // ~20 FPS for subtle animation
          glowPhaseRef.current += 0.05;
          drawNeon();
          lastTime = time;
        }
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [drawNeon]);

    // Expose export function via ref
    useImperativeHandle(ref, () => ({
      exportAsImage: () => {
        const canvas = canvasRef.current;
        if (canvas) {
          return canvas.toDataURL("image/png");
        }
        return null;
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "auto",
          aspectRatio: `${width} / ${height}`,
          borderRadius: "12px",
        }}
      />
    );
  }
);

NeonCanvas.displayName = "NeonCanvas";

export default NeonCanvas;
