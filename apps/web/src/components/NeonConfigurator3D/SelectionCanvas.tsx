"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { StyledChar, TextAlign, splitStyledCharsIntoLines } from "./types";
import styles from "./NeonConfigurator3D.module.scss";

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface CharBounds {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SelectionCanvasProps {
  styledChars: StyledChar[];
  selectedIndices: Set<number>;
  onSelectionChange: (indices: Set<number>) => void;
  textAlign: TextAlign;
}

// Check if two rectangles intersect
function rectsIntersect(
  r1: { x: number; y: number; width: number; height: number },
  r2: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    r1.x + r1.width < r2.x ||
    r2.x + r2.width < r1.x ||
    r1.y + r1.height < r2.y ||
    r2.y + r2.height < r1.y
  );
}

export default function SelectionCanvas({
  styledChars,
  selectedIndices,
  onSelectionChange,
  textAlign,
}: SelectionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [charBounds, setCharBounds] = useState<CharBounds[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  // Canvas dimensions
  const canvasWidth = 600;
  const canvasHeight = 300;
  const fontSize = 48;
  const lineHeight = fontSize * 1.3;
  const padding = 30;

  // Draw text and track character bounds
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Split into lines
    const lines = splitStyledCharsIntoLines(styledChars);
    const newCharBounds: CharBounds[] = [];

    let globalIndex = 0;

    // Draw each line
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const y = padding + lineHeight * 0.8 + lineIndex * lineHeight;

      // Calculate line width
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
        x = canvasWidth - padding - lineWidth;
      } else {
        x = (canvasWidth - lineWidth) / 2;
      }

      // Draw each character
      for (const styledChar of line) {
        ctx.font = `bold ${fontSize}px ${styledChar.fontFamily}`;
        const charWidth = ctx.measureText(styledChar.char).width;

        // Store bounds
        newCharBounds.push({
          index: globalIndex,
          x,
          y: y - fontSize * 0.8,
          width: charWidth,
          height: fontSize * 1.1,
        });

        // Draw character with color
        const isSelected = selectedIndices.has(globalIndex);

        // Highlight selected characters
        if (isSelected) {
          ctx.fillStyle = "rgba(236, 72, 153, 0.3)";
          ctx.fillRect(x, y - fontSize * 0.8, charWidth, fontSize * 1.1);
        }

        // Draw glow effect
        ctx.shadowColor =
          styledChar.color === "rainbow" ? "#ff3366" : styledChar.color;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw text
        ctx.fillStyle =
          styledChar.color === "rainbow" ? "#ff3366" : styledChar.color;
        ctx.fillText(styledChar.char, x, y);

        // Reset shadow
        ctx.shadowBlur = 0;

        x += charWidth;
        globalIndex++;
      }

      // Account for newline character
      globalIndex++;
    }

    setCharBounds(newCharBounds);
  }, [styledChars, selectedIndices, textAlign]);

  // Redraw when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Draw selection rectangle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectionBox) return;

    // Redraw base
    drawCanvas();

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw selection rectangle
    const x = Math.min(selectionBox.startX, selectionBox.endX);
    const y = Math.min(selectionBox.startY, selectionBox.endY);
    const w = Math.abs(selectionBox.endX - selectionBox.startX);
    const h = Math.abs(selectionBox.endY - selectionBox.startY);

    if (w > 2 && h > 2) {
      ctx.strokeStyle = "#ff3366";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);

      // Translucent fill
      ctx.fillStyle = "rgba(255, 51, 102, 0.1)";
      ctx.fillRect(x, y, w, h);
    }
  }, [selectionBox, drawCanvas]);

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setIsSelecting(true);
      setSelectionBox({ startX: x, startY: y, endX: x, endY: y });

      // Clear selection if not holding shift
      if (!e.shiftKey) {
        onSelectionChange(new Set());
      }
    },
    [onSelectionChange]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isSelecting) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setSelectionBox((prev) => (prev ? { ...prev, endX: x, endY: y } : null));
    },
    [isSelecting]
  );

  const handleMouseUp = useCallback(() => {
    if (!isSelecting || !selectionBox) {
      setIsSelecting(false);
      setSelectionBox(null);
      return;
    }

    // Calculate selection rect
    const selRect = {
      x: Math.min(selectionBox.startX, selectionBox.endX),
      y: Math.min(selectionBox.startY, selectionBox.endY),
      width: Math.abs(selectionBox.endX - selectionBox.startX),
      height: Math.abs(selectionBox.endY - selectionBox.startY),
    };

    // Find intersecting characters
    const newSelected = new Set(selectedIndices);
    for (const cb of charBounds) {
      if (rectsIntersect(selRect, cb)) {
        newSelected.add(cb.index);
      }
    }

    onSelectionChange(newSelected);
    setIsSelecting(false);
    setSelectionBox(null);
  }, [
    isSelecting,
    selectionBox,
    charBounds,
    selectedIndices,
    onSelectionChange,
  ]);

  // Handle click on single character
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find clicked character
      for (const cb of charBounds) {
        if (
          x >= cb.x &&
          x <= cb.x + cb.width &&
          y >= cb.y &&
          y <= cb.y + cb.height
        ) {
          const newSelected = new Set(e.shiftKey ? selectedIndices : []);
          if (newSelected.has(cb.index)) {
            newSelected.delete(cb.index);
          } else {
            newSelected.add(cb.index);
          }
          onSelectionChange(newSelected);
          break;
        }
      }
    },
    [charBounds, selectedIndices, onSelectionChange]
  );

  // Global mouse up
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        handleMouseUp();
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isSelecting, handleMouseUp]);

  return (
    <div ref={containerRef} className={styles.selectionCanvasContainer}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={styles.selectionCanvas}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
      />
      <div className={styles.selectionCanvasHint}>
        Click hoặc kéo để chọn ký tự • Shift+Click để multi-select
      </div>
    </div>
  );
}
