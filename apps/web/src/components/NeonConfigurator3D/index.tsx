"use client";

import { useState } from "react";
import Scene from "./Scene";
import styles from "./NeonConfigurator3D.module.scss";

const fonts = [
  { name: "Inter", path: "/fonts/Inter_Bold.json" },
  { name: "Helvetiker", path: "/fonts/helvetiker_regular.typeface.json" },
  { name: "Optimer", path: "/fonts/optimer_regular.typeface.json" },
  {
    name: "Gentilis (Script-ish)",
    path: "/fonts/DancingScript-Regular.typeface.json",
  }, // Using Gentilis as placeholder for now
];

const backboards = [
  { name: "Cut to Shape", value: "cut-to-shape" },
  { name: "Rectangle", value: "rectangle" },
  { name: "None", value: "none" },
];

export default function NeonConfigurator3D() {
  const [text, setText] = useState("KING NEON");
  const [color, setColor] = useState("#ff00ff");
  const [font, setFont] = useState(fonts[0].path);
  const [size, setSize] = useState(1.5);
  const [backboard, setBackboard] = useState(backboards[0].value);
  const [cameraDistance, setCameraDistance] = useState(20);

  const handleZoomIn = () => setCameraDistance((prev) => Math.max(2, prev - 5));
  const handleZoomOut = () =>
    setCameraDistance((prev) => Math.min(100, prev + 5));

  return (
    <div className={styles.container}>
      {/* 3D Canvas Area */}
      <div className={styles.canvasContainer}>
        <Scene
          text={text}
          color={color}
          font={font}
          size={size}
          backboard={backboard}
          cameraDistance={cameraDistance}
        />

        {/* Zoom Controls Overlay on Canvas */}
        <div className={styles.zoomControls}>
          <button onClick={handleZoomIn}>+</button>
          <button onClick={handleZoomOut}>-</button>
        </div>
      </div>

      {/* UI Controls Overlay */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label>Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={20}
          />
        </div>

        <div className={styles.controlGroup}>
          <label>Font</label>
          <select value={font} onChange={(e) => setFont(e.target.value)}>
            {fonts.map((f) => (
              <option key={f.name} value={f.path}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label>Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        <div className={styles.controlGroup}>
          <label>Size</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={size}
            onChange={(e) => setSize(parseFloat(e.target.value))}
          />
        </div>

        <div className={styles.controlGroup}>
          <label>Backboard</label>
          <select
            value={backboard}
            onChange={(e) => setBackboard(e.target.value)}
          >
            {backboards.map((b) => (
              <option key={b.name} value={b.value}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
