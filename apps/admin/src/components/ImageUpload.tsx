"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import styles from "./ImageUpload.module.scss";

export interface PendingFile {
  file: File;
  preview: string;
}

interface ImageUploadProps {
  images: string[]; // Already uploaded image URLs
  pendingFiles: PendingFile[]; // Files waiting to be uploaded
  onImagesChange: (images: string[]) => void;
  onPendingFilesChange: (files: PendingFile[]) => void;
  maxFiles?: number;
}

export default function ImageUpload({
  images,
  pendingFiles,
  onImagesChange,
  onPendingFilesChange,
  maxFiles = 5,
}: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCount = images.length + pendingFiles.length;

  const handleFileSelect = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      // Validate
      const validFiles = fileArray.filter((file) => {
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed");
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Max file size is 5MB");
          return false;
        }
        return true;
      });

      if (totalCount + validFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} images allowed`);
        return;
      }

      // Create previews
      const newPendingFiles: PendingFile[] = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file), // Be careful with memory leaks if many files
      }));

      onPendingFilesChange([...pendingFiles, ...newPendingFiles]);
      setError(null);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [pendingFiles, totalCount, maxFiles, onPendingFilesChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const removePendingFile = (index: number) => {
    const file = pendingFiles[index];
    URL.revokeObjectURL(file.preview); // Clean up
    const newPending = pendingFiles.filter((_, i) => i !== index);
    onPendingFilesChange(newPending);
  };

  const addManualUrl = (url: string) => {
    if (url.trim() && totalCount < maxFiles) {
      onImagesChange([...images, url.trim()]);
    }
  };

  return (
    <div className={styles.container}>
      {/* Image Grid */}
      {(images.length > 0 || pendingFiles.length > 0) && (
        <div className={styles.grid}>
          {/* Existing uploaded images */}
          {images.map((url, index) => (
            <div key={`img-${index}`} className={styles["preview-item"]}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Product image ${index + 1}`} />
              <button
                type="button"
                className={styles["remove-btn"]}
                onClick={() => removeImage(index)}
              >
                <X size={14} />
              </button>
              {index === 0 && (
                <span className={`${styles.label} ${styles.uploaded}`}>
                  Uploaded
                </span>
              )}
            </div>
          ))}

          {/* Pending files (not yet uploaded) */}
          {pendingFiles.map((pending, index) => (
            <div
              key={`pending-${index}`}
              className={`${styles["preview-item"]} ${styles.pending}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pending.preview} alt={`Pending upload ${index + 1}`} />
              <button
                type="button"
                className={styles["remove-btn"]}
                onClick={() => removePendingFile(index)}
              >
                <X size={14} />
              </button>
              <span className={`${styles.label} ${styles.pending}`}>
                Pending
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {totalCount < maxFiles && (
        <div
          className={`${styles.dropzone} ${dragOver ? styles.active : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleInputChange}
            style={{ display: "none" }}
          />

          <Upload size={32} className={styles.icon} />
          <p className={styles["text-main"]}>Drag and drop images here</p>
          <p className={styles["text-sub"]}>
            or click to browse • {totalCount}/{maxFiles} images
          </p>
        </div>
      )}

      {/* Error */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Manual URL input */}
      <div className={styles["manual-input"]}>
        <p>Or add image URL manually:</p>
        <div className={styles["input-row"]}>
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            id="manual-url-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                addManualUrl(input.value);
                input.value = "";
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById(
                "manual-url-input"
              ) as HTMLInputElement;
              addManualUrl(input.value);
              input.value = "";
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Info */}
      {pendingFiles.length > 0 && (
        <div className={styles["info-banner"]}>
          <ImageIcon size={16} />
          <p>{pendingFiles.length} image(s) will be uploaded when you save</p>
        </div>
      )}
    </div>
  );
}
