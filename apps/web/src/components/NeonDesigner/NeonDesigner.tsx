"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./NeonDesigner.module.scss";

// Mock data - in production these would come from API
const fonts = [
  { id: "1", name: "Neon Script", fontFamily: "'Dancing Script', cursive" },
  { id: "2", name: "Modern Sans", fontFamily: "'Outfit', sans-serif" },
  { id: "3", name: "Bold Impact", fontFamily: "'Anton', sans-serif" },
  { id: "4", name: "Elegant Serif", fontFamily: "'Playfair Display', serif" },
  { id: "5", name: "Retro", fontFamily: "'Pacifico', cursive" },
  { id: "6", name: "Minimal", fontFamily: "'Inter', sans-serif" },
];

const colors = [
  { id: "1", name: "Hot Pink", hexCode: "#ff3366", priceModifier: 0 },
  { id: "2", name: "Electric Blue", hexCode: "#00d4ff", priceModifier: 0 },
  { id: "3", name: "Purple", hexCode: "#9d4edd", priceModifier: 0 },
  { id: "4", name: "Green", hexCode: "#00ff88", priceModifier: 0 },
  { id: "5", name: "Yellow", hexCode: "#ffff00", priceModifier: 10 },
  { id: "6", name: "Orange", hexCode: "#ff6b00", priceModifier: 0 },
  { id: "7", name: "White", hexCode: "#ffffff", priceModifier: 0 },
  { id: "8", name: "Warm White", hexCode: "#ffe4c4", priceModifier: 0 },
];

const sizes = [
  { id: "1", name: "Small", width: '20"', maxLetters: 8, price: 150 },
  { id: "2", name: "Medium", width: '30"', maxLetters: 12, price: 250 },
  { id: "3", name: "Large", width: '40"', maxLetters: 16, price: 350 },
  { id: "4", name: "Extra Large", width: '50"', maxLetters: 20, price: 450 },
];

const materials = [
  {
    id: "1",
    name: "Indoor",
    description: "For indoor use only",
    priceModifier: 0,
  },
  {
    id: "2",
    name: "Waterproof",
    description: "Indoor & outdoor use",
    priceModifier: 50,
  },
];

const backboards = [
  { id: "1", name: "Cut to Shape", type: "cut-to-shape", priceModifier: 0 },
  { id: "2", name: "Rectangle", type: "rectangle", priceModifier: 30 },
  { id: "3", name: "No Backboard", type: "none", priceModifier: -20 },
];

const backboardColors = [
  { id: "1", name: "Transparent", color: "transparent" },
  { id: "2", name: "Black", color: "#000000" },
  { id: "3", name: "White", color: "#ffffff" },
  { id: "4", name: "Gold Mirror", color: "#d4af37" },
];

interface DesignState {
  text: string;
  fontId: string;
  colorId: string;
  sizeId: string;
  materialId: string;
  backboardId: string;
  backboardColorId: string;
}

const steps = [
  { id: 1, title: "Your Text" },
  { id: 2, title: "Choose Font" },
  { id: 3, title: "Pick Color" },
  { id: 4, title: "Select Size" },
  { id: 5, title: "Material" },
  { id: 6, title: "Backboard" },
  { id: 7, title: "Backboard Color" },
];

export default function NeonDesigner() {
  const [design, setDesign] = useState<DesignState>({
    text: "Hello World",
    fontId: "1",
    colorId: "1",
    sizeId: "2",
    materialId: "1",
    backboardId: "1",
    backboardColorId: "1",
  });

  const [openSteps, setOpenSteps] = useState<number[]>([1]);

  const toggleStep = (stepId: number) => {
    setOpenSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  };

  const selectedFont = fonts.find((f) => f.id === design.fontId);
  const selectedColor = colors.find((c) => c.id === design.colorId);
  const selectedSize = sizes.find((s) => s.id === design.sizeId);
  const selectedMaterial = materials.find((m) => m.id === design.materialId);
  const selectedBackboard = backboards.find((b) => b.id === design.backboardId);

  const calculatedPrice = useMemo(() => {
    const basePrice = selectedSize?.price || 0;
    const colorMod = selectedColor?.priceModifier || 0;
    const materialMod = selectedMaterial?.priceModifier || 0;
    const backboardMod = selectedBackboard?.priceModifier || 0;
    const linesCost = (design.text.split("\n").length - 1) * 50;

    return basePrice + colorMod + materialMod + backboardMod + linesCost;
  }, [
    design,
    selectedSize,
    selectedColor,
    selectedMaterial,
    selectedBackboard,
  ]);

  const completedSteps = useMemo(() => {
    const completed: number[] = [];
    if (design.text.trim()) completed.push(1);
    if (design.fontId) completed.push(2);
    if (design.colorId) completed.push(3);
    if (design.sizeId) completed.push(4);
    if (design.materialId) completed.push(5);
    if (design.backboardId) completed.push(6);
    if (design.backboardColorId) completed.push(7);
    return completed;
  }, [design]);

  const neonStyle = {
    fontFamily: selectedFont?.fontFamily,
    color: selectedColor?.hexCode,
    textShadow: `
      0 0 7px ${selectedColor?.hexCode},
      0 0 10px ${selectedColor?.hexCode},
      0 0 21px ${selectedColor?.hexCode},
      0 0 42px ${selectedColor?.hexCode}
    `,
  };

  return (
    <div className={styles.designer}>
      <div className={styles.designer__container}>
        {/* Header */}
        <div className={styles.designer__header}>
          <h1 className={styles.designer__title}>Create Your Neon Sign</h1>
          <p className={styles.designer__subtitle}>
            Design your perfect custom LED neon sign in minutes
          </p>
        </div>

        <div className={styles.designer__layout}>
          {/* Preview Panel */}
          <div className={styles.designer__preview}>
            <div className={styles["designer__preview-label"]}>
              Live Preview
            </div>
            <div className={styles["designer__preview-canvas"]}>
              <motion.div
                className={styles["designer__preview-text"]}
                style={neonStyle}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {design.text || "Your Text Here"}
              </motion.div>
            </div>
            <div className={styles["designer__preview-price"]}>
              <div className={styles["designer__preview-price-label"]}>
                Estimated Price
              </div>
              <div className={styles["designer__preview-price-value"]}>
                ${calculatedPrice}
              </div>
            </div>
          </div>

          {/* Steps Panel */}
          <div className={styles.designer__steps}>
            {/* Progress Bar */}
            <div className={styles.designer__progress}>
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`${styles["designer__progress-step"]} ${
                    completedSteps.includes(step.id) ? styles.completed : ""
                  } ${openSteps.includes(step.id) ? styles.active : ""}`}
                />
              ))}
            </div>

            {/* Step 1: Text */}
            <StepCard
              step={1}
              title="Your Text"
              isOpen={openSteps.includes(1)}
              onToggle={() => toggleStep(1)}
            >
              <textarea
                className={styles["designer__text-input"]}
                placeholder="Enter your text..."
                value={design.text}
                onChange={(e) => setDesign({ ...design, text: e.target.value })}
                rows={3}
              />
              <p className={styles["designer__text-hint"]}>
                Press Enter for multiple lines. Max{" "}
                {selectedSize?.maxLetters || 12} characters per line.
              </p>
            </StepCard>

            {/* Step 2: Font */}
            <StepCard
              step={2}
              title="Choose Font"
              isOpen={openSteps.includes(2)}
              onToggle={() => toggleStep(2)}
            >
              <div className={styles.designer__options}>
                {fonts.map((font) => (
                  <div
                    key={font.id}
                    className={`${styles.designer__option} ${
                      design.fontId === font.id ? styles.selected : ""
                    }`}
                    onClick={() => setDesign({ ...design, fontId: font.id })}
                  >
                    <div
                      className={styles["designer__font-preview"]}
                      style={{ fontFamily: font.fontFamily }}
                    >
                      Aa
                    </div>
                    <div className={styles["designer__option-name"]}>
                      {font.name}
                    </div>
                  </div>
                ))}
              </div>
            </StepCard>

            {/* Step 3: Color */}
            <StepCard
              step={3}
              title="Pick Color"
              isOpen={openSteps.includes(3)}
              onToggle={() => toggleStep(3)}
            >
              <div
                className={`${styles.designer__options} ${styles["designer__options--colors"]}`}
              >
                {colors.map((color) => (
                  <div
                    key={color.id}
                    className={`${styles.designer__color} ${
                      design.colorId === color.id ? styles.selected : ""
                    }`}
                    style={{
                      backgroundColor: color.hexCode,
                      boxShadow:
                        design.colorId === color.id
                          ? `0 0 20px ${color.hexCode}`
                          : "none",
                    }}
                    onClick={() => setDesign({ ...design, colorId: color.id })}
                    title={color.name}
                  />
                ))}
              </div>
            </StepCard>

            {/* Step 4: Size */}
            <StepCard
              step={4}
              title="Select Size"
              isOpen={openSteps.includes(4)}
              onToggle={() => toggleStep(4)}
            >
              <div className={styles.designer__options}>
                {sizes.map((size) => (
                  <div
                    key={size.id}
                    className={`${styles.designer__option} ${
                      design.sizeId === size.id ? styles.selected : ""
                    }`}
                    onClick={() => setDesign({ ...design, sizeId: size.id })}
                  >
                    <div className={styles["designer__option-name"]}>
                      {size.name}
                    </div>
                    <div className={styles["designer__option-price"]}>
                      {size.width}
                    </div>
                    <div className={styles["designer__option-price"]}>
                      ${size.price}
                    </div>
                  </div>
                ))}
              </div>
            </StepCard>

            {/* Step 5: Material */}
            <StepCard
              step={5}
              title="Material"
              isOpen={openSteps.includes(5)}
              onToggle={() => toggleStep(5)}
            >
              <div className={styles.designer__options}>
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className={`${styles.designer__option} ${
                      design.materialId === material.id ? styles.selected : ""
                    }`}
                    onClick={() =>
                      setDesign({ ...design, materialId: material.id })
                    }
                  >
                    <div className={styles["designer__option-name"]}>
                      {material.name}
                    </div>
                    <div className={styles["designer__option-price"]}>
                      {material.description}
                    </div>
                    {material.priceModifier > 0 && (
                      <div className={styles["designer__option-price"]}>
                        +${material.priceModifier}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </StepCard>

            {/* Step 6: Backboard */}
            <StepCard
              step={6}
              title="Backboard Type"
              isOpen={openSteps.includes(6)}
              onToggle={() => toggleStep(6)}
            >
              <div className={styles.designer__options}>
                {backboards.map((backboard) => (
                  <div
                    key={backboard.id}
                    className={`${styles.designer__option} ${
                      design.backboardId === backboard.id ? styles.selected : ""
                    }`}
                    onClick={() =>
                      setDesign({ ...design, backboardId: backboard.id })
                    }
                  >
                    <div className={styles["designer__option-name"]}>
                      {backboard.name}
                    </div>
                    {backboard.priceModifier !== 0 && (
                      <div className={styles["designer__option-price"]}>
                        {backboard.priceModifier > 0 ? "+" : ""}$
                        {backboard.priceModifier}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </StepCard>

            {/* Step 7: Backboard Color */}
            <StepCard
              step={7}
              title="Backboard Color"
              isOpen={openSteps.includes(7)}
              onToggle={() => toggleStep(7)}
            >
              <div className={styles.designer__options}>
                {backboardColors.map((bc) => (
                  <div
                    key={bc.id}
                    className={`${styles.designer__option} ${
                      design.backboardColorId === bc.id ? styles.selected : ""
                    }`}
                    onClick={() =>
                      setDesign({ ...design, backboardColorId: bc.id })
                    }
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: bc.color,
                        border:
                          bc.color === "transparent"
                            ? "2px dashed rgba(255,255,255,0.3)"
                            : "none",
                        margin: "0 auto",
                      }}
                    />
                    <div className={styles["designer__option-name"]}>
                      {bc.name}
                    </div>
                  </div>
                ))}
              </div>
            </StepCard>

            {/* Actions */}
            <div className={styles.designer__actions}>
              <button className="btn btn--primary btn--lg" style={{ flex: 1 }}>
                Add to Cart - ${calculatedPrice}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Card Component
function StepCard({
  step,
  title,
  isOpen,
  onToggle,
  children,
}: {
  step: number;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.designer__step}>
      <div className={styles["designer__step-header"]} onClick={onToggle}>
        <span className={styles["designer__step-number"]}>{step}</span>
        <span className={styles["designer__step-title"]}>{title}</span>
        <span
          className={`${styles["designer__step-toggle"]} ${isOpen ? styles.open : ""}`}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles["designer__step-content"]}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
