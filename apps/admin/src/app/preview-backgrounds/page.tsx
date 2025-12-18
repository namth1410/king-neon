"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import api from "@/utils/api";
import styles from "./page.module.css";

interface PreviewBackground {
  id: string;
  name: string;
  imageKey: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function PreviewBackgroundsPage() {
  const [backgrounds, setBackgrounds] = useState<PreviewBackground[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL || "http://localhost:9002";

  const fetchBackgrounds = useCallback(async () => {
    try {
      const res = await api.get("/neon/preview-backgrounds/admin/all");
      setBackgrounds(res.data);
    } catch (error) {
      console.error("Failed to fetch backgrounds:", error);
      toast.error("Failed to load backgrounds");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackgrounds();
  }, [fetchBackgrounds]);

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setUploading(true);
    let successCount = 0;

    try {
      // Upload all files in one request
      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i]);
      }
      formData.append("folder", "preview-backgrounds");

      const uploadRes = await api.post("/upload/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedFiles = uploadRes.data;

      // Create preview background records for each uploaded file
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        const name = newName.trim() || fileName;

        try {
          await api.post("/neon/preview-backgrounds", {
            name: selectedFiles.length > 1 ? `${name} ${i + 1}` : name,
            imageKey: uploadedFiles[i].key,
            isActive: true,
            sortOrder: backgrounds.length + i,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to create record for ${file.name}:`, error);
        }
      }

      setNewName("");
      setSelectedFiles(null);
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      fetchBackgrounds();
      toast.success(`Successfully uploaded ${successCount} background(s)`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload backgrounds");
    } finally {
      setUploading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/neon/preview-backgrounds/${id}/toggle`);
      fetchBackgrounds();
      toast.success("Background status updated");
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Failed to toggle background");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this background?")) return;

    try {
      await api.delete(`/neon/preview-backgrounds/${id}`);
      fetchBackgrounds();
      toast.success("Background deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete background");
    }
  };

  const getImageUrl = (imageKey: string) => {
    return `${minioUrl}/king-neon/${imageKey}`;
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />
      <div className={styles.header}>
        <h1>Preview Backgrounds</h1>
        <p>Manage background images for the neon designer preview</p>
      </div>

      {/* Upload Form */}
      <div className={styles.uploadForm}>
        <h2>Add New Background</h2>
        <div className={styles.formRow}>
          <input
            type="text"
            placeholder="Background name (e.g., Living Room)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={styles.input}
          />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setSelectedFiles(e.target.files)}
            className={styles.fileInput}
          />
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFiles || selectedFiles.length === 0}
            className={styles.uploadBtn}
          >
            {uploading
              ? "Uploading..."
              : `Upload ${selectedFiles?.length || 0} file(s)`}
          </button>
        </div>
        <p className={styles.hint}>
          💡 Tip: Name is optional. If empty, filenames will be used. You can
          select multiple images at once.
        </p>
      </div>

      {/* Backgrounds List */}
      <div className={styles.list}>
        {loading ? (
          <p>Loading...</p>
        ) : backgrounds.length === 0 ? (
          <p className={styles.empty}>No backgrounds yet. Upload one above.</p>
        ) : (
          <div className={styles.grid}>
            {backgrounds.map((bg) => (
              <div
                key={bg.id}
                className={`${styles.card} ${!bg.isActive ? styles.inactive : ""}`}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={getImageUrl(bg.imageKey)}
                    alt={bg.name}
                    fill
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                  {!bg.isActive && (
                    <div className={styles.inactiveOverlay}>Inactive</div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <h3>{bg.name}</h3>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleToggle(bg.id)}
                      className={`${styles.toggleBtn} ${bg.isActive ? styles.active : ""}`}
                    >
                      {bg.isActive ? "Active" : "Inactive"}
                    </button>
                    <button
                      onClick={() => handleDelete(bg.id)}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
