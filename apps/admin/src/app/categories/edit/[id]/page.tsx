"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/utils/api";
import ImageUpload, { PendingFile } from "@/components/ImageUpload";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    image: "",
    sortOrder: 0,
    active: true,
  });
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get(`/categories/${categoryId}`);
        setFormData({
          name: res.data.name || "",
          slug: res.data.slug || "",
          description: res.data.description || "",
          icon: res.data.icon || "",
          image: res.data.image || "",
          sortOrder: res.data.sortOrder || 0,
          active: res.data.active ?? true,
        });
      } catch (err) {
        console.error("Failed to fetch category:", err);
        setError("Failed to load category");
      } finally {
        setIsFetching(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleToggleActive = () => {
    setFormData((prev) => ({ ...prev, active: !prev.active }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Upload pending image first
      let uploadedImageUrl = formData.image;

      if (pendingFiles.length > 0) {
        const uploadFormData = new FormData();
        pendingFiles.forEach((p) => {
          uploadFormData.append("files", p.file);
        });

        const uploadRes = await api.post("/upload/images", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const result = uploadRes.data;
        if (Array.isArray(result) && result.length > 0) {
          uploadedImageUrl =
            typeof result[0] === "string" ? result[0] : result[0].url || "";
        } else if (result.urls && result.urls.length > 0) {
          uploadedImageUrl = result.urls[0];
        }
      }

      await api.patch(`/categories/${categoryId}`, {
        ...formData,
        image: uploadedImageUrl,
        sortOrder: parseInt(String(formData.sortOrder)) || 0,
      });
      router.push("/categories");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to update category");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "0.75rem",
    padding: "0.875rem 1.25rem",
    color: "white",
    fontSize: "0.95rem",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "0.5rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.02em",
  };

  if (isFetching) {
    return (
      <DashboardLayout title="Edit Category">
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Loading category...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Category">
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Link
          href="/categories"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "1.5rem",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={20} />
          Back to Categories
        </Link>

        {error && (
          <div
            style={{
              padding: "1rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "0.75rem",
              color: "#ef4444",
              marginBottom: "1.5rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: "rgba(20,20,20,0.4)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1.5rem",
              padding: "2rem",
            }}
          >
            <h2
              style={{
                color: "white",
                fontWeight: 600,
                marginBottom: "1.5rem",
              }}
            >
              Edit Category
            </h2>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., LED Neon Signs"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleSlugChange}
                required
                placeholder="e.g., led-neon-signs"
                style={inputStyle}
              />
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.4)",
                  marginTop: "0.25rem",
                }}
              >
                URL-friendly identifier
              </p>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of this category..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <label style={labelStyle}>Icon</label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  placeholder="e.g., neon"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Sort Order</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  min="0"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Category Image */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Category Image</label>
              <div
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                }}
              >
                <ImageUpload
                  images={formData.image ? [formData.image] : []}
                  onImagesChange={(imgs) =>
                    setFormData((prev) => ({ ...prev, image: imgs[0] || "" }))
                  }
                  pendingFiles={pendingFiles}
                  onPendingFilesChange={setPendingFiles}
                  maxFiles={1}
                />
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.4)",
                  marginTop: "0.5rem",
                }}
              >
                Image for the category gallery display
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.7)" }}>Active</span>
              <button
                type="button"
                onClick={handleToggleActive}
                style={{
                  width: "48px",
                  height: "26px",
                  borderRadius: "9999px",
                  background: formData.active
                    ? "#22c55e"
                    : "rgba(255,255,255,0.15)",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: formData.active ? "25px" : "3px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "white",
                    transition: "left 0.2s",
                  }}
                />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <Link
                href="/categories"
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem",
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: "0.75rem 2rem",
                  background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                  border: "none",
                  borderRadius: "0.75rem",
                  color: "white",
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
