"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/utils/api";
import ImageUpload, { PendingFile } from "@/components/ImageUpload";
import styles from "./page.module.scss";

interface Category {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    basePrice: "",
    categoryId: "",
    description: "",
    isCustom: false,
    active: true,
    images: [] as string[],
  });

  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  // Fetch categories on mount
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Auto-generate slug from name if slug is empty or matches previous name slugified
    if (
      name === "name" &&
      (!formData.slug || formData.slug === slugify(formData.name))
    ) {
      setFormData((prev) => ({ ...prev, name: value, slug: slugify(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w-]+/g, "") // Remove all non-word chars
      .replace(/--+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text
  };

  const handleToggleActive = () => {
    setFormData((prev) => ({ ...prev, active: !prev.active }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Upload pending images first
      let uploadedImageUrls: string[] = [];
      if (pendingFiles.length > 0) {
        const uploadFormData = new FormData();
        pendingFiles.forEach((p) => {
          uploadFormData.append("files", p.file);
        });

        const uploadRes = await api.post("/upload/images", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const result = uploadRes.data;
        if (Array.isArray(result)) {
          uploadedImageUrls = result.map((item: { url?: string } | string) =>
            typeof item === "string" ? item : item.url || ""
          );
        } else if (result.urls) {
          uploadedImageUrls = result.urls;
        }
      }

      const finalImages = [...formData.images, ...uploadedImageUrls];

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        basePrice: parseFloat(formData.basePrice) || 0,
        categoryId: formData.categoryId || undefined,
        isCustom: formData.isCustom,
        active: formData.active,
        images: finalImages,
        featuredImage: finalImages[0] || undefined,
      };

      await api.post("/products", payload);
      toast.success("Product created successfully");
      router.push("/products");
    } catch (error) {
      console.error("Failed to create product", error);
      toast.error("Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Product">
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/products" className={styles["back-link"]}>
            <ArrowLeft size={20} />
            <span>Back to Products</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles["form-grid"]}>
            {/* Left Column: Main Info */}
            <div className="left-column">
              <div className={styles.card}>
                <h3>Basic Information</h3>

                <div className={styles["input-group"]}>
                  <label htmlFor="name">Product Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Neon Heart Sign"
                  />
                </div>

                <div className={styles["input-group"]}>
                  <label htmlFor="slug">Slug (URL)</label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    required
                    placeholder="e.g. neon-heart-sign"
                  />
                </div>

                <div className={styles["input-group"]}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Product description..."
                  />
                </div>
              </div>

              <div className={styles.card}>
                <h3>Media</h3>
                <ImageUpload
                  images={formData.images}
                  onImagesChange={(imgs) =>
                    setFormData((prev) => ({ ...prev, images: imgs }))
                  }
                  pendingFiles={pendingFiles}
                  onPendingFilesChange={setPendingFiles}
                  maxFiles={10}
                />
              </div>
            </div>

            {/* Right Column: Pricing & Organization */}
            <div className="right-column">
              <div className={styles.card}>
                <h3>Status</h3>
                <div className={styles["status-row"]}>
                  <span>Active Status</span>
                  <button
                    type="button"
                    onClick={handleToggleActive}
                    className={`${styles["toggle-btn"]} ${formData.active ? styles.active : styles.inactive}`}
                  >
                    <span />
                  </button>
                </div>
              </div>

              <div className={styles.card}>
                <h3>Pricing</h3>
                <div className={styles["input-group"]}>
                  <label htmlFor="basePrice">Base Price ($)</label>
                  <input
                    type="number"
                    id="basePrice"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className={styles.card}>
                <h3>Organization</h3>
                <div className={styles["input-group"]}>
                  <label htmlFor="categoryId">Category</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/products" className={styles["btn-cancel"]}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className={styles["btn-submit"]}
            >
              {isLoading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
