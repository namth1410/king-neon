"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ExternalLink, Loader2, FolderOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/utils/api";
import styles from "./designs.module.scss";

interface SavedDesign {
  id: string;
  textLines: string[];
  fontId: string;
  colorId: string;
  sizeId: string;
  calculatedPrice: number;
  createdAt: string;
  font?: { name: string };
  color?: { name: string; hexCode: string };
  size?: { name: string };
}

export default function MyDesignsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/account/designs");
      return;
    }

    if (isAuthenticated) {
      fetchDesigns();
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchDesigns = async () => {
    try {
      const response = await api.get("/neon/designs/my-designs");
      setDesigns(response.data);
    } catch (error) {
      console.error("Failed to fetch designs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this design?")) return;

    setDeletingId(id);
    try {
      await api.delete(`/neon/designs/${id}`);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Failed to delete design:", error);
      alert("Failed to delete design. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpen = (design: SavedDesign) => {
    const params = new URLSearchParams({
      text: design.textLines.join("\n"),
      font: design.fontId,
      color: design.colorId,
      size: design.sizeId,
    });
    router.push(`/create?${params.toString()}`);
  };

  if (authLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={32} />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>My Designs</h1>
          <p>Your saved custom neon sign designs</p>
        </header>

        {isLoading ? (
          <div className={styles.loading}>
            <Loader2 className={styles.spinner} size={32} />
            <p>Loading your designs...</p>
          </div>
        ) : designs.length === 0 ? (
          <div className={styles.empty}>
            <FolderOpen size={48} />
            <h2>No Saved Designs</h2>
            <p>You haven&apos;t saved any designs yet.</p>
            <button
              className={styles.createBtn}
              onClick={() => router.push("/create")}
            >
              Create Your First Design
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            <AnimatePresence>
              {designs.map((design) => (
                <motion.div
                  key={design.id}
                  className={styles.card}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  {/* Preview */}
                  <div
                    className={styles.preview}
                    style={{
                      color: design.color?.hexCode || "#ff3366",
                      textShadow: `
                        0 0 10px ${design.color?.hexCode || "#ff3366"},
                        0 0 20px ${design.color?.hexCode || "#ff3366"},
                        0 0 40px ${design.color?.hexCode || "#ff3366"}
                      `,
                    }}
                  >
                    {design.textLines.join("\n") || "Untitled"}
                  </div>

                  {/* Info */}
                  <div className={styles.info}>
                    <div className={styles.meta}>
                      <span>{design.font?.name || "Unknown Font"}</span>
                      <span>•</span>
                      <span>{design.size?.name || "Medium"}</span>
                    </div>
                    <div className={styles.price}>
                      ${design.calculatedPrice}
                    </div>
                    <div className={styles.date}>
                      {new Date(design.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={styles.actions}>
                    <button
                      className={styles.openBtn}
                      onClick={() => handleOpen(design)}
                    >
                      <ExternalLink size={16} />
                      Open
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(design.id)}
                      disabled={deletingId === design.id}
                    >
                      {deletingId === design.id ? (
                        <Loader2 className={styles.spinner} size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
