"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import api from "@/utils/api";
import styles from "./ImageUpload.module.scss";

interface ImageUploadProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  multiple = false,
  label = "Upload Image",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const images = Array.isArray(value) ? value : value ? [value] : [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();

      if (multiple) {
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
        const res = await api.post("/upload/images", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newUrls = (Array.isArray(res.data) ? res.data : [res.data]).map(
          (item: { url?: string } | string) =>
            typeof item === "string" ? item : item.url || ""
        );
        onChange([...images, ...newUrls]);
      } else {
        formData.append("file", files[0]);
        const res = await api.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const url = res.data.url || res.data;
        onChange(url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    if (multiple) {
      const newImages = [...images];
      newImages.splice(index, 1);
      onChange(newImages);
    } else {
      onChange("");
    }
  };

  return (
    <div className={styles["image-upload"]}>
      {label && (
        <label className={styles["image-upload__label"]}>{label}</label>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className={styles["image-upload__grid"]}>
          {images.map((url, index) => (
            <div key={url + index} className={styles["image-upload__preview"]}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Uploaded" />
              <button
                type="button"
                className={styles["image-upload__preview-remove"]}
                onClick={() => removeImage(index)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {(!value || multiple) && (
        <div
          className={`${styles["image-upload__dropzone"]} ${
            uploading ? styles["image-upload__dropzone--active"] : ""
          }`}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="animate-spin text-primary" size={32} />
          ) : (
            <>
              <Upload
                size={32}
                className={styles["image-upload__dropzone-icon"]}
              />
              <div className={styles["image-upload__dropzone-text"]}>
                <strong>Click to upload</strong> or drag and drop
              </div>
              <div className={styles["image-upload__dropzone-subtext"]}>
                SVG, PNG, JPG or GIF (max. 5MB)
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleUpload}
            style={{ display: "none" }}
          />
        </div>
      )}
    </div>
  );
}
