"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Upload,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
} from "lucide-react";

// Dynamic import Scene with SSR disabled to avoid @react-three/postprocessing issues
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#666",
      }}
    >
      Loading 3D Scene...
    </div>
  ),
});
import SelectionCanvas from "./SelectionCanvas";
import { ProcessingMethod } from "./NeonLogo";
import {
  useDraftStorage,
  NeonConfigurator3DDraft,
  DRAFT_KEYS,
} from "@/hooks/useDraftStorage";
import DraftRecoveryModal from "@/components/DraftRecoveryModal";
import {
  StyledChar,
  TextAlign,
  stringToStyledChars,
  applyStyleToAll,
  applyStyleToIndices,
  styledCharsToString,
} from "./types";
import styles from "./NeonConfigurator3D.module.scss";

// Google Fonts available for 2D canvas
const fonts = [
  // Script / Cursive Fonts
  {
    name: "Dancing Script",
    fontFamily: "'Dancing Script', cursive",
    category: "script",
  },
  {
    name: "Great Vibes",
    fontFamily: "'Great Vibes', cursive",
    category: "script",
  },
  { name: "Allura", fontFamily: "'Allura', cursive", category: "script" },
  {
    name: "Sacramento",
    fontFamily: "'Sacramento', cursive",
    category: "script",
  },
  {
    name: "Parisienne",
    fontFamily: "'Parisienne', cursive",
    category: "script",
  },

  // Handwritten
  { name: "Caveat", fontFamily: "'Caveat', cursive", category: "handwritten" },
  {
    name: "Shadows Into Light",
    fontFamily: "'Shadows Into Light', cursive",
    category: "handwritten",
  },

  // Sans-Serif / Modern
  {
    name: "Montserrat",
    fontFamily: "'Montserrat', sans-serif",
    category: "sans-serif",
  },
  {
    name: "Quicksand",
    fontFamily: "'Quicksand', sans-serif",
    category: "sans-serif",
  },
  {
    name: "Poppins",
    fontFamily: "'Poppins', sans-serif",
    category: "sans-serif",
  },
  { name: "Inter", fontFamily: "'Inter', sans-serif", category: "sans-serif" },

  // Serif / Elegant
  {
    name: "Playfair Display",
    fontFamily: "'Playfair Display', serif",
    category: "serif",
  },
  { name: "Cinzel", fontFamily: "'Cinzel', serif", category: "serif" },
  { name: "Cormorant", fontFamily: "'Cormorant', serif", category: "serif" },

  // Display
  {
    name: "Amatic SC",
    fontFamily: "'Amatic SC', cursive",
    category: "display",
  },
  {
    name: "Bebas Neue",
    fontFamily: "'Bebas Neue', sans-serif",
    category: "display",
  },
];

const backboards = [
  { name: "Cut to Shape", value: "cut-to-shape" },
  { name: "Rectangle", value: "rectangle" },
  { name: "None", value: "none" },
];

const presetColors = [
  { name: "Hot Pink", value: "#ff3366" },
  { name: "Cyan", value: "#00ffff" },
  { name: "Magenta", value: "#ff00ff" },
  { name: "Neon Green", value: "#00ff88" },
  { name: "Electric Blue", value: "#0088ff" },
  { name: "Orange", value: "#ff6600" },
  { name: "Yellow", value: "#ffff00" },
  { name: "White", value: "#ffffff" },
  { name: "Rainbow", value: "rainbow" }, // Special rainbow/gradient option
];

export default function NeonConfigurator3D() {
  // Default styling for new characters
  const [defaultColor, setDefaultColor] = useState("#ff00ff");
  const [defaultFontFamily, setDefaultFontFamily] = useState(
    fonts[0].fontFamily
  );

  // Per-character styled text
  const [styledChars, setStyledChars] = useState<StyledChar[]>(() =>
    stringToStyledChars("KING\nNEON", "#ff00ff", fonts[0].fontFamily)
  );

  // Set-based selection for SelectionCanvas (indices of selected characters)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set()
  );

  // View vs Select mode toggle
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Common text options
  const [size, setSize] = useState(1.5);
  const [backboard, setBackboard] = useState(backboards[0].value);
  const [borderWidth, setBorderWidth] = useState(0.5);
  const [textAlign, setTextAlign] = useState<TextAlign>("center");
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>();

  // Logo states
  const [logoImage, setLogoImage] = useState<string | undefined>();
  const [logoSize, setLogoSize] = useState(2);
  const [logoOutlineWidth, setLogoOutlineWidth] = useState(0.5);
  const [logoProcessingMethod, setLogoProcessingMethod] =
    useState<ProcessingMethod>("original");
  const [logoColor, setLogoColor] = useState("#ff00ff");

  // Mode: 'text' or 'logo'
  const [mode, setMode] = useState<"text" | "logo">("text");

  // Reset select mode when switching away from text mode
  useEffect(() => {
    if (mode !== "text") {
      setIsSelectMode(false);
    }
  }, [mode]);

  // Glow controls
  const [glowIntensity, setGlowIntensity] = useState(1.5);
  const [glowSpread, setGlowSpread] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Camera reset function from Scene
  const [resetCameraFn, setResetCameraFn] = useState<(() => void) | null>(null);

  // Draft recovery modal state
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [pendingDraft, setPendingDraft] =
    useState<NeonConfigurator3DDraft | null>(null);
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);

  // Draft storage hook
  const { saveDraftDebounced, loadDraft, clearDraft, getTimeSinceModified } =
    useDraftStorage<NeonConfigurator3DDraft>(DRAFT_KEYS.NEON_CONFIGURATOR_3D);

  // Check for saved draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setPendingDraft(draft);
      setDraftTimestamp(getTimeSinceModified());
      setShowRecoveryModal(true);
    }
  }, [loadDraft, getTimeSinceModified]);

  // Auto-save design changes (debounced)
  useEffect(() => {
    // Don't save if recovery modal is still showing
    if (showRecoveryModal) return;

    // Convert styledChars back to legacy format for compatibility
    const text = styledCharsToString(styledChars);

    saveDraftDebounced({
      mode,
      text,
      color: defaultColor,
      fontFamily: defaultFontFamily,
      size,
      backboard,
      borderWidth,
      textAlign,
      logoSize,
      logoOutlineWidth,
      logoProcessingMethod,
      // Save per-character styling as a new field
      styledChars,
    });
  }, [
    mode,
    styledChars,
    defaultColor,
    defaultFontFamily,
    size,
    backboard,
    borderWidth,
    textAlign,
    logoSize,
    logoOutlineWidth,
    logoProcessingMethod,
    saveDraftDebounced,
    showRecoveryModal,
  ]);

  // Handle continuing from draft
  const handleContinueDraft = useCallback(() => {
    if (pendingDraft) {
      setMode(pendingDraft.mode);

      // Check for new styledChars format first
      if (pendingDraft.styledChars && pendingDraft.styledChars.length > 0) {
        setStyledChars(pendingDraft.styledChars);
      } else {
        // Migrate from old format
        setStyledChars(
          stringToStyledChars(
            pendingDraft.text,
            pendingDraft.color,
            pendingDraft.fontFamily
          )
        );
      }

      setDefaultColor(pendingDraft.color);
      setDefaultFontFamily(pendingDraft.fontFamily);
      setSize(pendingDraft.size);
      setBackboard(pendingDraft.backboard);
      setBorderWidth(pendingDraft.borderWidth);
      setTextAlign(pendingDraft.textAlign);
      setLogoSize(pendingDraft.logoSize);
      setLogoOutlineWidth(pendingDraft.logoOutlineWidth);
      setLogoProcessingMethod(
        pendingDraft.logoProcessingMethod as ProcessingMethod
      );
    }
    setShowRecoveryModal(false);
    setPendingDraft(null);
  }, [pendingDraft]);

  // Handle starting fresh
  const handleStartFresh = useCallback(() => {
    clearDraft();
    setShowRecoveryModal(false);
    setPendingDraft(null);
  }, [clearDraft]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearBackground = () => {
    setBackgroundImage(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoImage(undefined);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  // Handle color change - applies to selection or all
  const handleColorChange = useCallback(
    (newColor: string) => {
      if (mode === "logo") {
        // In logo mode, just update the logo color
        setLogoColor(newColor);
        return;
      }

      // In text mode - check if we have a canvas selection (selectedIndices)
      if (isSelectMode && selectedIndices.size > 0) {
        // Apply to canvas-selected characters
        setStyledChars((prev) =>
          applyStyleToIndices(prev, selectedIndices, { color: newColor })
        );
      } else {
        // Apply to all characters and update default
        setDefaultColor(newColor);
        setStyledChars((prev) => applyStyleToAll(prev, { color: newColor }));
      }
    },
    [mode, isSelectMode, selectedIndices]
  );

  // Handle font change - applies to selection or all
  const handleFontChange = useCallback(
    (newFontFamily: string) => {
      // Check canvas selection first (when in select mode)
      if (isSelectMode && selectedIndices.size > 0) {
        setStyledChars((prev) =>
          applyStyleToIndices(prev, selectedIndices, {
            fontFamily: newFontFamily,
          })
        );
      } else {
        // Apply to all characters and update default
        setDefaultFontFamily(newFontFamily);
        setStyledChars((prev) =>
          applyStyleToAll(prev, { fontFamily: newFontFamily })
        );
      }
    },
    [isSelectMode, selectedIndices]
  );

  // Get current active color for color picker display
  const getActiveColor = (): string => {
    if (mode === "logo") return logoColor;

    if (isSelectMode && selectedIndices.size > 0) {
      // Return the color of the first selected character
      const firstIndex = [...selectedIndices][0];
      return styledChars[firstIndex]?.color || defaultColor;
    }
    return defaultColor;
  };

  // Get current active font for font selector display
  const getActiveFont = (): string => {
    if (isSelectMode && selectedIndices.size > 0) {
      // Return the font of the first selected character
      const firstIndex = [...selectedIndices][0];
      return styledChars[firstIndex]?.fontFamily || defaultFontFamily;
    }
    return defaultFontFamily;
  };

  const activeColor = getActiveColor();
  const activeFont = getActiveFont();

  return (
    <div className={styles.container}>
      {/* 3D Canvas Area with optional background image */}
      <div
        className={styles.canvasContainer}
        style={
          backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <Scene
          styledChars={styledChars}
          size={size}
          backboard={backboard}
          borderWidth={borderWidth}
          textAlign={textAlign}
          mode={mode}
          logoUrl={logoImage}
          logoSize={logoSize}
          logoOutlineWidth={logoOutlineWidth}
          logoProcessingMethod={logoProcessingMethod}
          logoColor={logoColor}
          onControlsReady={(resetFn) => setResetCameraFn(() => resetFn)}
          glowIntensity={glowIntensity}
          glowSpread={glowSpread}
        />

        {/* Reset View Button */}
        {resetCameraFn && !isSelectMode && (
          <button
            className={styles.resetViewBtn}
            onClick={resetCameraFn}
            title="Reset camera view"
          >
            <RotateCcw size={18} />
            Reset View
          </button>
        )}

        {/* View/Select Mode Toggle Button */}
        {mode === "text" && (
          <button
            className={`${styles.selectModeBtn} ${isSelectMode ? styles.active : ""}`}
            onClick={() => setIsSelectMode(!isSelectMode)}
            title={
              isSelectMode ? "Switch to View mode" : "Switch to Select mode"
            }
          >
            {isSelectMode ? "🔍 Select Mode" : "👁️ View Mode"}
          </button>
        )}

        {/* Character Selection Overlay - shows when in select mode */}
        {mode === "text" && isSelectMode && (
          <div className={styles.selectModeOverlay}>
            <SelectionCanvas
              styledChars={styledChars}
              selectedIndices={selectedIndices}
              onSelectionChange={setSelectedIndices}
              textAlign={textAlign}
            />

            {/* Inline controls for select mode */}
            <div className={styles.selectModeControls}>
              {selectedIndices.size > 0 && (
                <span className={styles.selectionBadge}>
                  {selectedIndices.size} selected
                </span>
              )}

              {/* Color swatches */}
              <div className={styles.colorSwatches}>
                {presetColors.slice(0, 6).map((color) => (
                  <button
                    key={color.value}
                    className={styles.colorSwatch}
                    style={{
                      background:
                        color.value === "rainbow"
                          ? "linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0088ff, #8800ff)"
                          : color.value,
                    }}
                    onClick={() => handleColorChange(color.value)}
                    title={color.name}
                    disabled={selectedIndices.size === 0}
                  />
                ))}
              </div>

              {/* Font selector */}
              <select
                className={styles.fontSelect}
                value={defaultFontFamily}
                onChange={(e) => handleFontChange(e.target.value)}
                disabled={selectedIndices.size === 0}
              >
                {fonts.map((font) => (
                  <option key={font.fontFamily} value={font.fontFamily}>
                    {font.name}
                  </option>
                ))}
              </select>

              {/* Done button */}
              <button
                className={styles.selectModeDoneBtn}
                onClick={() => setIsSelectMode(false)}
              >
                ✓ Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* UI Controls Overlay */}
      <div className={styles.controls}>
        {/* Mode Toggle */}
        <div className={styles.controlGroup}>
          <label>Mode</label>
          <div className={styles.alignButtons}>
            <button
              className={mode === "text" ? styles.active : ""}
              onClick={() => setMode("text")}
            >
              Text
            </button>
            <button
              className={mode === "logo" ? styles.active : ""}
              onClick={() => setMode("logo")}
            >
              Logo
            </button>
          </div>
        </div>

        {/* TEXT MODE CONTROLS */}
        {mode === "text" && (
          <>
            <div className={styles.controlGroup}>
              <label>Text</label>
              <textarea
                className={styles.textInput}
                value={styledCharsToString(styledChars)}
                onChange={(e) => {
                  // Convert plain text to styledChars with default styling
                  setStyledChars(
                    stringToStyledChars(
                      e.target.value,
                      defaultColor,
                      defaultFontFamily
                    )
                  );
                }}
                placeholder="Enter your text..."
                rows={2}
              />
            </div>

            <div className={styles.controlGroup}>
              <label>Align</label>
              <div className={styles.alignButtons}>
                <button
                  className={textAlign === "left" ? styles.active : ""}
                  onClick={() => setTextAlign("left")}
                  title="Align Left"
                >
                  <AlignLeft size={18} />
                </button>
                <button
                  className={textAlign === "center" ? styles.active : ""}
                  onClick={() => setTextAlign("center")}
                  title="Align Center"
                >
                  <AlignCenter size={18} />
                </button>
                <button
                  className={textAlign === "right" ? styles.active : ""}
                  onClick={() => setTextAlign("right")}
                  title="Align Right"
                >
                  <AlignRight size={18} />
                </button>
              </div>
            </div>

            <div className={styles.controlGroup}>
              <label>
                Font
                {isSelectMode && selectedIndices.size > 0 ? " (sel)" : ""}
              </label>
              <select
                value={activeFont}
                onChange={(e) => handleFontChange(e.target.value)}
              >
                <optgroup label="✨ Script">
                  {fonts
                    .filter((f) => f.category === "script")
                    .map((f) => (
                      <option key={f.name} value={f.fontFamily}>
                        {f.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="✍️ Handwritten">
                  {fonts
                    .filter((f) => f.category === "handwritten")
                    .map((f) => (
                      <option key={f.name} value={f.fontFamily}>
                        {f.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="🔤 Sans-Serif">
                  {fonts
                    .filter((f) => f.category === "sans-serif")
                    .map((f) => (
                      <option key={f.name} value={f.fontFamily}>
                        {f.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="📖 Serif">
                  {fonts
                    .filter((f) => f.category === "serif")
                    .map((f) => (
                      <option key={f.name} value={f.fontFamily}>
                        {f.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="🎨 Display">
                  {fonts
                    .filter((f) => f.category === "display")
                    .map((f) => (
                      <option key={f.name} value={f.fontFamily}>
                        {f.name}
                      </option>
                    ))}
                </optgroup>
              </select>
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

            {backboard === "cut-to-shape" && (
              <div className={styles.controlGroup}>
                <label>Border</label>
                <input
                  type="range"
                  min="0.2"
                  max="1.5"
                  step="0.1"
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(parseFloat(e.target.value))}
                />
              </div>
            )}
          </>
        )}

        {/* LOGO MODE CONTROLS */}
        {mode === "logo" && (
          <>
            <div className={styles.controlGroup}>
              <label>Logo</label>
              <div className={styles.uploadGroup}>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: "none" }}
                />
                <button
                  className={styles.uploadBtn}
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload size={16} />
                  Upload
                </button>
                {logoImage && (
                  <button
                    className={styles.clearBtn}
                    onClick={clearLogo}
                    title="Clear logo"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {logoImage && (
              <>
                <div className={styles.controlGroup}>
                  <label>Style</label>
                  <select
                    value={logoProcessingMethod}
                    onChange={(e) =>
                      setLogoProcessingMethod(
                        e.target.value as ProcessingMethod
                      )
                    }
                  >
                    <option value="original">Original + Glow</option>
                    <option value="outline">Outline Only</option>
                  </select>
                </div>

                <div className={styles.controlGroup}>
                  <label>Size</label>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={logoSize}
                    onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label>Outline</label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={logoOutlineWidth}
                    onChange={(e) =>
                      setLogoOutlineWidth(parseFloat(e.target.value))
                    }
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Color Picker - shared between modes */}
        <div className={styles.controlGroup}>
          <label>
            Color
            {mode === "text" && isSelectMode && selectedIndices.size > 0
              ? " (sel)"
              : ""}
          </label>
          <div className={styles.colorPicker}>
            {activeColor !== "rainbow" && (
              <input
                type="color"
                value={activeColor}
                onChange={(e) => handleColorChange(e.target.value)}
              />
            )}
            <div className={styles.colorPresets}>
              {presetColors.map((c) => (
                <button
                  key={c.name}
                  title={c.name}
                  style={
                    c.value === "rainbow"
                      ? {
                          background:
                            "linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0088ff, #ff00ff)",
                        }
                      : { backgroundColor: c.value }
                  }
                  className={activeColor === c.value ? styles.active : ""}
                  onClick={() => handleColorChange(c.value)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Glow Controls */}
        <div className={styles.controlGroup}>
          <label>Glow</label>
          <div className={styles.glowSliders}>
            <div className={styles.sliderItem}>
              <span>Int</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={glowIntensity}
                onChange={(e) => setGlowIntensity(parseFloat(e.target.value))}
                title="Intensity"
              />
            </div>
            <div className={styles.sliderItem}>
              <span>Spr</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={glowSpread}
                onChange={(e) => setGlowSpread(parseFloat(e.target.value))}
                title="Spread"
              />
            </div>
          </div>
        </div>

        {/* Background Image Upload - shared between modes */}
        <div className={styles.controlGroup}>
          <label>BG</label>
          <div className={styles.uploadGroup}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <button
              className={styles.uploadBtn}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
            </button>
            {backgroundImage && (
              <button
                className={styles.clearBtn}
                onClick={clearBackground}
                title="Clear background"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Draft Recovery Modal */}
      <DraftRecoveryModal
        isOpen={showRecoveryModal}
        onContinue={handleContinueDraft}
        onStartFresh={handleStartFresh}
        onClose={handleStartFresh}
        preview={styledCharsToString(styledChars)}
        lastModified={draftTimestamp ?? undefined}
      />
    </div>
  );
}
