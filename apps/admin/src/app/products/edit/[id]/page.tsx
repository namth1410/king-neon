"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/DashboardLayout";
import ImageUpload, { PendingFile } from "@/components/ImageUpload";
import api from "@/utils/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: string;
  category: Category | null;
  categoryId: string | null;
  active: boolean;
  isCustom: boolean;
  images: string[];
  featuredImage: string | null;
}

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: "",
    categoryId: "",
    active: true,
    isCustom: false,
    images: [] as string[],
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories/active");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${productId}`);
        const product: Product = response.data;
        setFormData({
          name: product.name,
          slug: product.slug,
          description: product.description || "",
          basePrice: product.basePrice,
          categoryId: product.category?.id || product.categoryId || "",
          active: product.active,
          isCustom: product.isCustom,
          images: product.images || [],
        });
      } catch (err) {
        console.error("Failed to fetch product:", err);
        toast.error("Failed to load product");
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, slug }));
  };

  const uploadPendingFiles = async (): Promise<string[]> => {
    if (pendingFiles.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const pending of pendingFiles) {
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("file", pending.file);

        const response = await api.post("/upload/image", formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        uploadedUrls.push(response.data.url);
      } catch (err) {
        console.error("Failed to upload file:", err);
        toast.error("Failed to upload image");
        throw new Error("Failed to upload image");
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // First upload any pending files
      const newImageUrls = await uploadPendingFiles();

      // Combine existing images with newly uploaded ones
      const allImages = [...formData.images, ...newImageUrls];

      // Update product
      await api.patch(`/products/${productId}`, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        basePrice: parseFloat(formData.basePrice),
        categoryId: formData.categoryId || undefined,
        active: formData.active,
        isCustom: formData.isCustom,
        images: allImages,
        featuredImage: allImages[0] || null,
      });

      // Clear pending files
      pendingFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setPendingFiles([]);

      toast.success("Product updated successfully");
      router.push("/products");
    } catch (err) {
      console.error("Failed to update product:", err);
      toast.error("Failed to update product");
      setError("Failed to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Product">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <Loader2
            size={40}
            style={{ animation: "spin 1s linear infinite", color: "#ff3366" }}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !formData.name) {
    return (
      <DashboardLayout title="Edit Product">
        <div style={{ textAlign: "center", padding: "60px" }}>
          <p style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</p>
          <button
            onClick={() => router.push("/products")}
            style={{
              padding: "12px 24px",
              background: "#ff3366",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Back to Products
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Product">
      <div style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <button
            onClick={() => router.push("/products")}
            style={{
              padding: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "white",
                marginBottom: "4px",
              }}
            >
              Edit Product
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
              Update product information
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: "16px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "12px",
              color: "#ef4444",
              marginBottom: "24px",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "32px",
            }}
          >
            {/* Name */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="e.g. Good Vibes Only"
              />
            </div>

            {/* Slug */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>URL Slug *</label>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="good-vibes-only"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  style={{
                    padding: "12px 20px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    color: "rgba(255,255,255,0.7)",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="Product description..."
              />
            </div>

            {/* Price & Category */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <div>
                <label style={labelStyle}>Base Price ($) *</label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  style={inputStyle}
                  placeholder="199.00"
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <div style={{ position: "relative" }}>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    style={{
                      ...inputStyle,
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      paddingRight: "40px",
                      cursor: "pointer",
                    }}
                  >
                    <option
                      value=""
                      style={{
                        background: "#1a1a1a",
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      Select category...
                    </option>
                    {categories.map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.id}
                        style={{
                          background: "#1a1a1a",
                          color: "white",
                          padding: "10px",
                        }}
                      >
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div
                    style={{
                      position: "absolute",
                      right: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 4.5L6 8L9.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: "flex", gap: "32px", marginBottom: "24px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  style={{
                    width: "20px",
                    height: "20px",
                    accentColor: "#ff3366",
                  }}
                />
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  Active (visible in store)
                </span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="isCustom"
                  checked={formData.isCustom}
                  onChange={handleChange}
                  style={{
                    width: "20px",
                    height: "20px",
                    accentColor: "#a855f7",
                  }}
                />
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  Custom Product
                </span>
              </label>
            </div>

            {/* Images */}
            <div style={{ marginBottom: "32px" }}>
              <label style={labelStyle}>Product Images</label>
              <ImageUpload
                images={formData.images}
                pendingFiles={pendingFiles}
                onImagesChange={(images) =>
                  setFormData((prev) => ({ ...prev, images }))
                }
                onPendingFilesChange={setPendingFiles}
                maxFiles={5}
              />
            </div>

            {/* Submit */}
            <div style={{ display: "flex", gap: "16px" }}>
              <button
                type="button"
                onClick={() => router.push("/products")}
                style={{
                  padding: "14px 28px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "14px 28px",
                  background: saving
                    ? "rgba(255,51,102,0.5)"
                    : "linear-gradient(135deg, #ff3366 0%, rgba(255,51,102,0.8) 100%)",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: 600,
                  boxShadow: saving
                    ? "none"
                    : "0 4px 20px rgba(255,51,102,0.3)",
                }}
              >
                {saving ? (
                  <>
                    <Loader2
                      size={20}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    {pendingFiles.length > 0
                      ? "Uploading & Saving..."
                      : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 500,
  color: "rgba(255,255,255,0.7)",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "white",
  fontSize: "15px",
  outline: "none",
};
