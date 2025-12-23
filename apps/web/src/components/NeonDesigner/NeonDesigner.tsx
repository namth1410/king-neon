"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch } from "react-redux";
import {
  ShoppingCart,
  Check,
  Download,
  Share2,
  CheckCircle,
  Save,
  LogIn,
} from "lucide-react";
import { addItemToCart, openCart } from "@/store/cartSlice";
import { useAuth } from "@/hooks/useAuth";
import {
  useDraftStorage,
  NeonDesignerDraft,
  DRAFT_KEYS,
} from "@/hooks/useDraftStorage";
import api from "@/utils/api";
import NeonCanvas, { NeonCanvasRef } from "./NeonCanvas";
import SaveDesignModal from "./SaveDesignModal";
import DraftRecoveryModal from "@/components/DraftRecoveryModal";
import styles from "./NeonDesigner.module.scss";

// Font options with Google Fonts (48 fonts from fonts.gstatic.com)
const defaultFonts = [
  // Script / Cursive Fonts
  { id: "1", name: "Dancing Script", fontFamily: "'Dancing Script', cursive" },
  { id: "2", name: "Great Vibes", fontFamily: "'Great Vibes', cursive" },
  { id: "3", name: "Allura", fontFamily: "'Allura', cursive" },
  { id: "4", name: "Alex Brush", fontFamily: "'Alex Brush', cursive" },
  { id: "5", name: "Sacramento", fontFamily: "'Sacramento', cursive" },
  { id: "6", name: "Parisienne", fontFamily: "'Parisienne', cursive" },
  { id: "7", name: "Tangerine", fontFamily: "'Tangerine', cursive" },
  {
    id: "8",
    name: "Mrs Saint Delafield",
    fontFamily: "'Mrs Saint Delafield', cursive",
  },
  {
    id: "9",
    name: "Herr Von Muellerhoff",
    fontFamily: "'Herr Von Muellerhoff', cursive",
  },
  {
    id: "10",
    name: "Monsieur La Doulaise",
    fontFamily: "'Monsieur La Doulaise', cursive",
  },
  {
    id: "11",
    name: "Petit Formal Script",
    fontFamily: "'Petit Formal Script', cursive",
  },
  { id: "12", name: "Charm", fontFamily: "'Charm', cursive" },
  { id: "13", name: "Borel", fontFamily: "'Borel', cursive" },

  // Handwritten Fonts
  { id: "14", name: "Caveat", fontFamily: "'Caveat', cursive" },
  {
    id: "15",
    name: "Shadows Into Light",
    fontFamily: "'Shadows Into Light', cursive",
  },
  { id: "16", name: "Handlee", fontFamily: "'Handlee', cursive" },
  {
    id: "17",
    name: "Cedarville Cursive",
    fontFamily: "'Cedarville Cursive', cursive",
  },
  {
    id: "18",
    name: "Dawning of a New Day",
    fontFamily: "'Dawning of a New Day', cursive",
  },
  { id: "19", name: "Neucha", fontFamily: "'Neucha', cursive" },
  { id: "20", name: "Slackside One", fontFamily: "'Slackside One', cursive" },

  // Brush / Asian Style
  {
    id: "21",
    name: "Nanum Brush Script",
    fontFamily: "'Nanum Brush Script', cursive",
  },
  {
    id: "22",
    name: "Nanum Pen Script",
    fontFamily: "'Nanum Pen Script', cursive",
  },
  {
    id: "23",
    name: "Yuji Hentaigana Akari",
    fontFamily: "'Yuji Hentaigana Akari', cursive",
  },
  { id: "24", name: "Zen Loop", fontFamily: "'Zen Loop', cursive" },

  // Serif / Elegant Fonts
  {
    id: "25",
    name: "Playfair Display",
    fontFamily: "'Playfair Display', serif",
  },
  { id: "26", name: "Cinzel", fontFamily: "'Cinzel', serif" },
  { id: "27", name: "Cormorant", fontFamily: "'Cormorant', serif" },
  {
    id: "28",
    name: "Cormorant Garamond",
    fontFamily: "'Cormorant Garamond', serif",
  },
  {
    id: "29",
    name: "Libre Baskerville",
    fontFamily: "'Libre Baskerville', serif",
  },
  { id: "30", name: "Crimson Text", fontFamily: "'Crimson Text', serif" },
  { id: "31", name: "Josefin Slab", fontFamily: "'Josefin Slab', serif" },
  { id: "32", name: "Nanum Myeongjo", fontFamily: "'Nanum Myeongjo', serif" },

  // Sans-Serif / Modern Fonts
  { id: "33", name: "Montserrat", fontFamily: "'Montserrat', sans-serif" },
  { id: "34", name: "Noto Sans", fontFamily: "'Noto Sans', sans-serif" },
  { id: "35", name: "Noto Sans JP", fontFamily: "'Noto Sans JP', sans-serif" },
  { id: "36", name: "Quicksand", fontFamily: "'Quicksand', sans-serif" },
  { id: "37", name: "Dosis", fontFamily: "'Dosis', sans-serif" },
  { id: "38", name: "Signika", fontFamily: "'Signika', sans-serif" },
  { id: "39", name: "Poiret One", fontFamily: "'Poiret One', cursive" },

  // Display / Decorative Fonts
  { id: "40", name: "Amatic SC", fontFamily: "'Amatic SC', cursive" },
  { id: "41", name: "BioRhyme", fontFamily: "'BioRhyme', serif" },
  {
    id: "42",
    name: "BioRhyme Expanded",
    fontFamily: "'BioRhyme Expanded', serif",
  },
  {
    id: "43",
    name: "BhuTuka Expanded One",
    fontFamily: "'BhuTuka Expanded One', serif",
  },
  { id: "44", name: "Graduate", fontFamily: "'Graduate', serif" },
  {
    id: "45",
    name: "Major Mono Display",
    fontFamily: "'Major Mono Display', monospace",
  },
  {
    id: "46",
    name: "Stint Ultra Condensed",
    fontFamily: "'Stint Ultra Condensed', serif",
  },
  {
    id: "47",
    name: "Nanum Gothic Coding",
    fontFamily: "'Nanum Gothic Coding', monospace",
  },
  {
    id: "48",
    name: "Noto Sans NKo Unjoined",
    fontFamily: "'Noto Sans NKo Unjoined', sans-serif",
  },
];

const defaultColors = [
  { id: "1", name: "Hot Pink", hexCode: "#ff3366", priceModifier: 0 },
  { id: "2", name: "Electric Blue", hexCode: "#00d4ff", priceModifier: 0 },
  { id: "3", name: "Purple", hexCode: "#9d4edd", priceModifier: 0 },
  { id: "4", name: "Neon Green", hexCode: "#00ff88", priceModifier: 0 },
  { id: "5", name: "Yellow", hexCode: "#ffff00", priceModifier: 10 },
  { id: "6", name: "Orange", hexCode: "#ff6b00", priceModifier: 0 },
  { id: "7", name: "Cool White", hexCode: "#ffffff", priceModifier: 0 },
  { id: "8", name: "Warm White", hexCode: "#ffe4c4", priceModifier: 0 },
  { id: "9", name: "Red", hexCode: "#ff0000", priceModifier: 0 },
  { id: "10", name: "Ice Blue", hexCode: "#a5f3fc", priceModifier: 0 },
  { id: "11", name: "Lemon", hexCode: "#fef08a", priceModifier: 10 },
  { id: "12", name: "Deep Purple", hexCode: "#7c3aed", priceModifier: 0 },
  { id: "13", name: "Rainbow RGB", hexCode: "rainbow", priceModifier: 25 },
];

const sizes = [
  {
    id: "1",
    name: "Small",
    width: '20"',
    height: '6"',
    maxLetters: 8,
    price: 149,
  },
  {
    id: "2",
    name: "Medium",
    width: '30"',
    height: '9"',
    maxLetters: 12,
    price: 249,
  },
  {
    id: "3",
    name: "Large",
    width: '40"',
    height: '12"',
    maxLetters: 16,
    price: 349,
  },
  {
    id: "4",
    name: "X-Large",
    width: '50"',
    height: '15"',
    maxLetters: 20,
    price: 449,
  },
  {
    id: "5",
    name: "XXL",
    width: '60"',
    height: '18"',
    maxLetters: 25,
    price: 599,
  },
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
    priceModifier: 75,
  },
];

const backboards = [
  {
    id: "1",
    name: "Cut to Shape",
    type: "cut-to-shape",
    description: "Follows the outline",
    priceModifier: 0,
  },
  {
    id: "2",
    name: "Rectangle",
    type: "rectangle",
    description: "Full rectangular board",
    priceModifier: 40,
  },
  {
    id: "3",
    name: "No Backboard",
    type: "none",
    description: "Neon only",
    priceModifier: -30,
  },
];

const backboardColors = [
  { id: "1", name: "Clear", color: "transparent" },
  { id: "2", name: "Black", color: "#000000" },
  { id: "3", name: "White", color: "#ffffff" },
  { id: "4", name: "Gold Mirror", color: "#d4af37" },
  { id: "5", name: "Rose Gold", color: "#b76e79" },
];

const mountingOptions = [
  {
    id: "1",
    name: "Standoffs",
    description: 'Mounts 1" from wall',
    priceModifier: 0,
  },
  {
    id: "2",
    name: "Hanging Kit",
    description: "Chain & hooks included",
    priceModifier: 15,
  },
  {
    id: "3",
    name: "Tabletop Stand",
    description: "Desktop display",
    priceModifier: 35,
  },
];

const remoteOptions = [
  {
    id: "1",
    name: "Standard Remote",
    description: "Basic dimmer control",
    priceModifier: 0,
  },
  {
    id: "2",
    name: "RF Wireless",
    description: "Long range remote",
    priceModifier: 20,
  },
];

interface DesignState {
  text: string;
  fontId: string;
  colorId: string;
  sizeId: string;
  materialId: string;
  backboardId: string;
  backboardColorId: string;
  mountingId: string;
  remoteId: string;
}

const steps = [
  { id: 1, title: "Your Text", icon: "✏️" },
  { id: 2, title: "Choose Font", icon: "🔤" },
  { id: 3, title: "Pick Color", icon: "🎨" },
  { id: 4, title: "Select Size", icon: "📐" },
  { id: 5, title: "Material", icon: "💧" },
  { id: 6, title: "Backboard", icon: "🖼️" },
  { id: 7, title: "Backboard Color", icon: "🎭" },
  { id: 8, title: "Mounting", icon: "🔧" },
  { id: 9, title: "Remote", icon: "📱" },
];

export default function NeonDesigner() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const canvasRef = useRef<NeonCanvasRef>(null);

  const [fonts] = useState(defaultFonts);
  const [colors] = useState(defaultColors);
  const [addedToCart, setAddedToCart] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewBackgrounds, setPreviewBackgrounds] = useState<
    { id: string; name: string; imageKey: string }[]
  >([]);
  const [selectedBgId, setSelectedBgId] = useState<string | null>(null);
  const [neonGlowEnabled, setNeonGlowEnabled] = useState(false);
  const [glowOpacity, setGlowOpacity] = useState(1);
  const [glowSpread, setGlowSpread] = useState(1);

  const [design, setDesign] = useState<DesignState>({
    text: "Your Text",
    fontId: "1",
    colorId: "1",
    sizeId: "2",
    materialId: "1",
    backboardId: "1",
    backboardColorId: "1",
    mountingId: "1",
    remoteId: "1",
  });

  const [openSteps, setOpenSteps] = useState<number[]>([1]);

  // Draft recovery modal state
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<NeonDesignerDraft | null>(
    null
  );
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);

  // Draft storage hook
  const { saveDraftDebounced, loadDraft, clearDraft, getTimeSinceModified } =
    useDraftStorage<NeonDesignerDraft>(DRAFT_KEYS.NEON_DESIGNER);

  // Load design from URL params on mount OR check for saved draft
  useEffect(() => {
    const text = searchParams.get("text");
    const font = searchParams.get("font");
    const color = searchParams.get("color");
    const size = searchParams.get("size");
    const material = searchParams.get("material");
    const backboard = searchParams.get("backboard");
    const bbcolor = searchParams.get("bbcolor");
    const mount = searchParams.get("mount");
    const remote = searchParams.get("remote");

    // If URL has design params, use those and clear any draft
    if (text || font || color) {
      setDesign((prev) => ({
        ...prev,
        ...(text && { text: decodeURIComponent(text) }),
        ...(font && { fontId: font }),
        ...(color && { colorId: color }),
        ...(size && { sizeId: size }),
        ...(material && { materialId: material }),
        ...(backboard && { backboardId: backboard }),
        ...(bbcolor && { backboardColorId: bbcolor }),
        ...(mount && { mountingId: mount }),
        ...(remote && { remoteId: remote }),
      }));
      clearDraft();
      return;
    }

    // Check for saved draft
    const draft = loadDraft();
    if (draft) {
      setPendingDraft(draft);
      setDraftTimestamp(getTimeSinceModified());
      setShowRecoveryModal(true);
    }
  }, [searchParams, loadDraft, clearDraft, getTimeSinceModified]);

  // Auto-save design changes (debounced)
  useEffect(() => {
    // Don't save if recovery modal is still showing
    if (showRecoveryModal) return;

    saveDraftDebounced({
      text: design.text,
      fontId: design.fontId,
      colorId: design.colorId,
      sizeId: design.sizeId,
      materialId: design.materialId,
      backboardId: design.backboardId,
      backboardColorId: design.backboardColorId,
      mountingId: design.mountingId,
      remoteId: design.remoteId,
    });
  }, [design, saveDraftDebounced, showRecoveryModal]);

  // Handle continuing from draft
  const handleContinueDraft = useCallback(() => {
    if (pendingDraft) {
      setDesign({
        text: pendingDraft.text,
        fontId: pendingDraft.fontId,
        colorId: pendingDraft.colorId,
        sizeId: pendingDraft.sizeId,
        materialId: pendingDraft.materialId,
        backboardId: pendingDraft.backboardId,
        backboardColorId: pendingDraft.backboardColorId,
        mountingId: pendingDraft.mountingId,
        remoteId: pendingDraft.remoteId,
      });
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

  // Fetch preview backgrounds from API
  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const res = await api.get("/neon/preview-backgrounds");
        setPreviewBackgrounds(res.data);
      } catch (error) {
        console.error("Failed to fetch preview backgrounds:", error);
      }
    };
    fetchBackgrounds();
  }, []);

  // Auto-enable neon glow when background is selected
  useEffect(() => {
    if (selectedBgId) {
      setNeonGlowEnabled(true);
    }
  }, [selectedBgId]);

  // Save design to API
  const handleSaveDesign = useCallback(
    async (name: string) => {
      setIsSaving(true);
      try {
        await api.post("/neon/designs", {
          name,
          textLines: design.text.split("\n"),
          fontId: design.fontId,
          colorId: design.colorId,
          sizeId: design.sizeId,
          materialId: design.materialId,
          backboardId: design.backboardId,
          backboardColor: design.backboardColorId,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } finally {
        setIsSaving(false);
      }
    },
    [design]
  );

  const toggleStep = (stepId: number) => {
    setOpenSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  };

  const openNextStep = (currentStep: number) => {
    if (currentStep < steps.length) {
      setOpenSteps([currentStep + 1]);
    }
  };

  const selectedFont = fonts.find((f) => f.id === design.fontId);
  const selectedColor = colors.find((c) => c.id === design.colorId);
  const selectedSize = sizes.find((s) => s.id === design.sizeId);
  const selectedMaterial = materials.find((m) => m.id === design.materialId);
  const selectedBackboard = backboards.find((b) => b.id === design.backboardId);
  const selectedBackboardColor = backboardColors.find(
    (bc) => bc.id === design.backboardColorId
  );
  const selectedMounting = mountingOptions.find(
    (m) => m.id === design.mountingId
  );
  const selectedRemote = remoteOptions.find((r) => r.id === design.remoteId);

  const calculatedPrice = useMemo(() => {
    const basePrice = selectedSize?.price || 0;
    const colorMod = selectedColor?.priceModifier || 0;
    const materialMod = selectedMaterial?.priceModifier || 0;
    const backboardMod = selectedBackboard?.priceModifier || 0;
    const mountingMod = selectedMounting?.priceModifier || 0;
    const remoteMod = selectedRemote?.priceModifier || 0;
    const linesCost = Math.max(0, (design.text.split("\n").length - 1) * 50);

    return (
      basePrice +
      colorMod +
      materialMod +
      backboardMod +
      mountingMod +
      remoteMod +
      linesCost
    );
  }, [
    design.text,
    selectedSize,
    selectedColor,
    selectedMaterial,
    selectedBackboard,
    selectedMounting,
    selectedRemote,
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
    if (design.mountingId) completed.push(8);
    if (design.remoteId) completed.push(9);
    return completed;
  }, [design]);

  // Compute background image URL
  const selectedBgUrl = useMemo(() => {
    if (!selectedBgId) return undefined;
    const bg = previewBackgrounds.find((b) => b.id === selectedBgId);
    if (!bg) return undefined;
    const minioUrl =
      process.env.NEXT_PUBLIC_MINIO_URL || "http://localhost:9002";
    return `${minioUrl}/king-neon/${bg.imageKey}`;
  }, [selectedBgId, previewBackgrounds]);

  // Download design as PNG
  const handleDownload = useCallback(() => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.exportAsImage();
      if (dataUrl) {
        const link = document.createElement("a");
        link.download = `neon-design-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    }
  }, []);

  // Share design URL
  const handleShare = useCallback(async () => {
    const params = new URLSearchParams({
      text: design.text,
      font: design.fontId,
      color: design.colorId,
      size: design.sizeId,
      material: design.materialId,
      backboard: design.backboardId,
      bbcolor: design.backboardColorId,
      mount: design.mountingId,
      remote: design.remoteId,
    });
    const shareUrl = `${window.location.origin}/create?${params.toString()}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      prompt("Copy this link:", shareUrl);
    }
  }, [design]);

  const handleAddToCart = () => {
    const customId = `custom-${Date.now()}`;

    dispatch(
      addItemToCart({
        id: customId,
        productId: customId,
        type: "custom",
        name: `Custom Neon: "${design.text.substring(0, 30)}${design.text.length > 30 ? "..." : ""}"`,
        price: calculatedPrice,
        quantity: 1,
        image: undefined,
        options: {
          font: selectedFont?.name,
          color: selectedColor?.name,
          size: selectedSize?.name,
          material: selectedMaterial?.name,
          backboard: selectedBackboard?.name,
          backboardColor: selectedBackboardColor?.name,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any
    );

    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      dispatch(openCart());
    }, 1500);
  };

  return (
    <div className={styles.designer}>
      <div className={styles.designer__container}>
        {/* Header */}
        <div className={styles.designer__header}>
          <h1 className={styles.designer__title}>Create Your Neon Sign</h1>
          <p className={styles.designer__subtitle}>
            Design your perfect custom LED neon sign in just a few steps
          </p>
        </div>

        <div className={styles.designer__layout}>
          {/* Preview Panel */}
          <div className={styles.designer__preview}>
            <div className={styles["designer__preview-label"]}>
              ✨ Live Preview
            </div>
            <div className={styles["designer__preview-canvas-wrapper"]}>
              <NeonCanvas
                ref={canvasRef}
                text={design.text || "Your Text Here"}
                fontFamily={
                  selectedFont?.fontFamily || "'Dancing Script', cursive"
                }
                color={selectedColor?.hexCode || "#ff3366"}
                backboardType={
                  (selectedBackboard?.type as
                    | "cut-to-shape"
                    | "rectangle"
                    | "none") || "cut-to-shape"
                }
                backboardColor={selectedBackboardColor?.color || "transparent"}
                backgroundImageUrl={selectedBgUrl}
                enhancedGlow={neonGlowEnabled}
                rainbowMode={selectedColor?.hexCode === "rainbow"}
                glowOpacity={glowOpacity}
                glowSpread={glowSpread}
              />
            </div>

            {/* Background Selector */}
            {previewBackgrounds.length > 0 && (
              <div className={styles["designer__toolbar"]}>
                {/* Left: Backgrounds */}
                <div className={styles["designer__toolbar-section"]}>
                  <div className={styles["designer__bg-list"]}>
                    <button
                      className={`${styles["designer__bg-btn"]} ${
                        !selectedBgId ? styles.active : ""
                      }`}
                      onClick={() => setSelectedBgId(null)}
                      title="No background"
                    >
                      ✕
                    </button>
                    {previewBackgrounds.map((bg) => {
                      const minioUrl =
                        process.env.NEXT_PUBLIC_MINIO_URL ||
                        "http://localhost:9002";
                      const imgUrl = `${minioUrl}/king-neon/${bg.imageKey}`;
                      return (
                        <button
                          key={bg.id}
                          className={`${styles["designer__bg-btn"]} ${
                            selectedBgId === bg.id ? styles.active : ""
                          }`}
                          onClick={() => setSelectedBgId(bg.id)}
                          title={bg.name}
                          style={{ backgroundImage: `url(${imgUrl})` }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Right: Glow Controls */}
                <div className={styles["designer__toolbar-section"]}>
                  {neonGlowEnabled && (
                    <div className={styles["designer__tools-sliders"]}>
                      <div className={styles["designer__slider-group"]}>
                        <span className={styles["designer__slider-label"]}>
                          Intensity
                        </span>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={glowOpacity}
                          onChange={(e) =>
                            setGlowOpacity(parseFloat(e.target.value))
                          }
                        />
                      </div>
                      <div className={styles["designer__slider-group"]}>
                        <span className={styles["designer__slider-label"]}>
                          Spread
                        </span>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={glowSpread}
                          onChange={(e) =>
                            setGlowSpread(parseFloat(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className={styles["designer__glow-toggle"]}>
                    <label className={styles["designer__toggle-label"]}>
                      <input
                        type="checkbox"
                        checked={neonGlowEnabled}
                        onChange={(e) => setNeonGlowEnabled(e.target.checked)}
                        className={styles["designer__toggle-checkbox"]}
                      />
                      <span className={styles["designer__toggle-switch"]} />
                      <span className={styles["designer__toggle-text"]}>
                        ✨ Glow
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Size indicator */}
            <div className={styles["designer__preview-size"]}>
              {selectedSize?.width} × {selectedSize?.height}
            </div>

            {/* Price Summary */}
            <div className={styles["designer__preview-price"]}>
              <div className={styles["designer__preview-price-breakdown"]}>
                <div>Base ({selectedSize?.name})</div>
                <div>${selectedSize?.price}</div>
              </div>
              {(selectedColor?.priceModifier ?? 0) > 0 && (
                <div className={styles["designer__preview-price-breakdown"]}>
                  <div>Color ({selectedColor?.name})</div>
                  <div>+${selectedColor?.priceModifier}</div>
                </div>
              )}
              {(selectedMaterial?.priceModifier ?? 0) > 0 && (
                <div className={styles["designer__preview-price-breakdown"]}>
                  <div>{selectedMaterial?.name}</div>
                  <div>+${selectedMaterial?.priceModifier}</div>
                </div>
              )}
              {(selectedBackboard?.priceModifier ?? 0) !== 0 && (
                <div className={styles["designer__preview-price-breakdown"]}>
                  <div>{selectedBackboard?.name}</div>
                  <div>
                    {(selectedBackboard?.priceModifier ?? 0) > 0 ? "+" : ""}$
                    {selectedBackboard?.priceModifier}
                  </div>
                </div>
              )}
              {(selectedMounting?.priceModifier ?? 0) > 0 && (
                <div className={styles["designer__preview-price-breakdown"]}>
                  <div>{selectedMounting?.name}</div>
                  <div>+${selectedMounting?.priceModifier}</div>
                </div>
              )}
              {(selectedRemote?.priceModifier ?? 0) > 0 && (
                <div className={styles["designer__preview-price-breakdown"]}>
                  <div>{selectedRemote?.name}</div>
                  <div>+${selectedRemote?.priceModifier}</div>
                </div>
              )}
              {design.text.split("\n").length > 1 && (
                <div className={styles["designer__preview-price-breakdown"]}>
                  <div>Extra Lines ({design.text.split("\n").length - 1})</div>
                  <div>+${(design.text.split("\n").length - 1) * 50}</div>
                </div>
              )}
              <div className={styles["designer__preview-price-total"]}>
                <div>Total</div>
                <div className={styles["designer__preview-price-value"]}>
                  ${calculatedPrice}
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              className={`${styles["designer__add-to-cart"]} ${addedToCart ? styles.added : ""}`}
              onClick={handleAddToCart}
            >
              {addedToCart ? (
                <>
                  <Check size={20} />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  Add to Cart - ${calculatedPrice}
                </>
              )}
            </button>

            {/* Action Buttons */}
            <div className={styles["designer__preview-actions"]}>
              <button
                className={styles["designer__action-btn"]}
                onClick={handleDownload}
                title="Download as PNG"
              >
                <Download size={18} />
                Download
              </button>
              <button
                className={`${styles["designer__action-btn"]} ${copied ? styles.copied : ""}`}
                onClick={handleShare}
                title="Copy share link"
              >
                {copied ? <CheckCircle size={18} /> : <Share2 size={18} />}
                {copied ? "Copied!" : "Share"}
              </button>
            </div>

            {/* Save Design Button */}
            {isAuthenticated ? (
              <button
                className={`${styles["designer__save-btn"]} ${saved ? styles.saved : ""}`}
                onClick={() => setShowSaveModal(true)}
                title="Save design to your account"
              >
                {saved ? <Check size={18} /> : <Save size={18} />}
                {saved ? "Design Saved!" : "Save Design"}
              </button>
            ) : (
              <button
                className={styles["designer__save-btn"]}
                onClick={() => router.push("/login?redirect=/create")}
                title="Login to save designs"
              >
                <LogIn size={18} />
                Login to Save
              </button>
            )}
          </div>

          {/* Save Design Modal */}
          <SaveDesignModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            onSave={handleSaveDesign}
            isSaving={isSaving}
          />

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
                  title={step.title}
                />
              ))}
            </div>

            {/* Step 1: Text */}
            <StepCard
              step={1}
              title="Your Text"
              icon="✏️"
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
                {selectedSize?.maxLetters || 12} characters recommended per
                line.
              </p>
              <button
                className={styles["designer__step-next"]}
                onClick={() => openNextStep(1)}
              >
                Next: Choose Font →
              </button>
            </StepCard>

            {/* Step 2: Font */}
            <StepCard
              step={2}
              title="Choose Font"
              icon="🔤"
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
              <button
                className={styles["designer__step-next"]}
                onClick={() => openNextStep(2)}
              >
                Next: Pick Color →
              </button>
            </StepCard>

            {/* Step 3: Color */}
            <StepCard
              step={3}
              title="Pick Color"
              icon="🎨"
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
                      background:
                        color.hexCode === "rainbow"
                          ? "conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"
                          : color.hexCode,
                      boxShadow:
                        design.colorId === color.id
                          ? color.hexCode === "rainbow"
                            ? "0 0 15px #ff0000, 0 0 30px #0000ff"
                            : `0 0 25px ${color.hexCode}, 0 0 50px ${color.hexCode}`
                          : color.hexCode === "rainbow"
                            ? "0 0 5px rgba(255, 255, 255, 0.3)"
                            : `0 0 10px ${color.hexCode}`,
                    }}
                    onClick={() => setDesign({ ...design, colorId: color.id })}
                    title={color.name}
                  />
                ))}
              </div>
              <p className={styles["designer__color-name"]}>
                Selected: <strong>{selectedColor?.name}</strong>
                {(selectedColor?.priceModifier ?? 0) > 0 &&
                  ` (+$${selectedColor?.priceModifier})`}
              </p>
              <button
                className={styles["designer__step-next"]}
                onClick={() => openNextStep(3)}
              >
                Next: Select Size →
              </button>
            </StepCard>

            {/* Step 4: Size */}
            <StepCard
              step={4}
              title="Select Size"
              icon="📐"
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
                    <div className={styles["designer__option-detail"]}>
                      {size.width} × {size.height}
                    </div>
                    <div className={styles["designer__option-price"]}>
                      ${size.price}
                    </div>
                  </div>
                ))}
              </div>
              <button
                className={styles["designer__step-next"]}
                onClick={() => openNextStep(4)}
              >
                Next: Material →
              </button>
            </StepCard>

            {/* Step 5: Material */}
            <StepCard
              step={5}
              title="Material"
              icon="💧"
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
                    <div className={styles["designer__option-detail"]}>
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
              <button
                className={styles["designer__step-next"]}
                onClick={() => openNextStep(5)}
              >
                Next: Backboard →
              </button>
            </StepCard>

            {/* Step 6: Backboard */}
            <StepCard
              step={6}
              title="Backboard Type"
              icon="🖼️"
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
                    <div className={styles["designer__option-detail"]}>
                      {backboard.description}
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
              <button
                className={styles["designer__step-next"]}
                onClick={() => openNextStep(6)}
              >
                Next: Backboard Color →
              </button>
            </StepCard>

            {/* Step 7: Backboard Color */}
            <StepCard
              step={7}
              title="Backboard Color"
              icon="🎭"
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
                        width: 50,
                        height: 50,
                        borderRadius: 8,
                        backgroundColor: bc.color,
                        border:
                          bc.color === "transparent"
                            ? "2px dashed rgba(255,255,255,0.3)"
                            : "2px solid rgba(255,255,255,0.1)",
                        margin: "0 auto 8px",
                      }}
                    />
                    <div className={styles["designer__option-name"]}>
                      {bc.name}
                    </div>
                  </div>
                ))}
              </div>
              <button
                className={styles["designer__step-next"]}
                onClick={() => openNextStep(7)}
              >
                Next: Mounting →
              </button>
            </StepCard>

            {/* Step 8: Mounting */}
            <StepCard
              step={8}
              title="Mounting Option"
              icon="🔧"
              isOpen={openSteps.includes(8)}
              onToggle={() => toggleStep(8)}
            >
              <div className={styles.designer__options}>
                {mountingOptions.map((mount) => (
                  <div
                    key={mount.id}
                    className={`${styles.designer__option} ${
                      design.mountingId === mount.id ? styles.selected : ""
                    }`}
                    onClick={() =>
                      setDesign({ ...design, mountingId: mount.id })
                    }
                  >
                    <div className={styles["designer__option-name"]}>
                      {mount.name}
                    </div>
                    <div className={styles["designer__option-detail"]}>
                      {mount.description}
                    </div>
                    {mount.priceModifier > 0 && (
                      <div className={styles["designer__option-price"]}>
                        +${mount.priceModifier}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                className={styles["designer__step-next"]}
                onClick={() => openNextStep(8)}
              >
                Next: Remote →
              </button>
            </StepCard>

            {/* Step 9: Remote */}
            <StepCard
              step={9}
              title="Remote Control"
              icon="📱"
              isOpen={openSteps.includes(9)}
              onToggle={() => toggleStep(9)}
            >
              <div className={styles.designer__options}>
                {remoteOptions.map((remote) => (
                  <div
                    key={remote.id}
                    className={`${styles.designer__option} ${
                      design.remoteId === remote.id ? styles.selected : ""
                    }`}
                    onClick={() =>
                      setDesign({ ...design, remoteId: remote.id })
                    }
                  >
                    <div className={styles["designer__option-name"]}>
                      {remote.name}
                    </div>
                    <div className={styles["designer__option-detail"]}>
                      {remote.description}
                    </div>
                    {remote.priceModifier > 0 && (
                      <div className={styles["designer__option-price"]}>
                        +${remote.priceModifier}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </StepCard>

            {/* Mobile Add to Cart */}
            <div className={styles["designer__mobile-actions"]}>
              <div className={styles["designer__mobile-price"]}>
                Total: <strong>${calculatedPrice}</strong>
              </div>
              <button
                className={`${styles["designer__add-to-cart"]} ${addedToCart ? styles.added : ""}`}
                onClick={handleAddToCart}
              >
                {addedToCart ? (
                  <>
                    <Check size={20} />
                    Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Recovery Modal */}
      <DraftRecoveryModal
        isOpen={showRecoveryModal}
        onContinue={handleContinueDraft}
        onStartFresh={handleStartFresh}
        onClose={handleStartFresh}
        preview={pendingDraft?.text}
        lastModified={draftTimestamp ?? undefined}
      />
    </div>
  );
}

// Step Card Component
function StepCard({
  step,
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  step: number;
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.designer__step} ${isOpen ? styles.open : ""}`}>
      <div className={styles["designer__step-header"]} onClick={onToggle}>
        <span className={styles["designer__step-icon"]}>{icon}</span>
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
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
