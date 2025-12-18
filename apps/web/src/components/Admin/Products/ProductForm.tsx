"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/Shared/ImageUpload";
import api from "@/utils/api";
import styles from "./ProductForm.module.scss";

interface Category {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

export default function ProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: 0,
    categoryId: "",
    isCustom: false,
    active: true,
    featuredImage: "",
    images: [] as string[],
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories/active");
        setCategories(res.data);
        // Set first category as default if available
        if (res.data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: res.data[0].id }));
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Generate slug if empty
      const payload = {
        name: formData.name,
        slug:
          formData.slug ||
          formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: formData.description,
        basePrice: formData.basePrice,
        categoryId: formData.categoryId || undefined,
        isCustom: formData.isCustom,
        active: formData.active,
        featuredImage: formData.featuredImage,
        images: formData.images,
      };

      await api.post("/products", payload);
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Failed to create product. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles["product-form"]}>
      {/* Left Column: Main Info */}
      <div className={styles["product-form__card"]}>
        <h3 className={styles["product-form__section-title"]}>
          Basic Information
        </h3>

        <div className={styles["product-form__group"]}>
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Dream Big Neon Sign"
          />
        </div>

        <div className={styles["product-form__group"]}>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Enter product description..."
          />
        </div>

        <div className={styles["product-form__group"]}>
          <label>Featured Image</label>
          <ImageUpload
            value={formData.featuredImage}
            onChange={(url) =>
              setFormData((prev) => ({ ...prev, featuredImage: url as string }))
            }
          />
        </div>

        <div className={styles["product-form__group"]}>
          <label>Product Gallery</label>
          <ImageUpload
            value={formData.images}
            multiple
            onChange={(urls) =>
              setFormData((prev) => ({ ...prev, images: urls as string[] }))
            }
          />
        </div>
      </div>

      {/* Right Column: Settings */}
      <div className={styles["product-form__card"]}>
        <h3 className={styles["product-form__section-title"]}>
          Product Settings
        </h3>

        <div className={styles["product-form__group"]}>
          <label>Base Price ($)</label>
          <input
            type="number"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className={styles["product-form__group"]}>
          <label>Category</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">Select category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles["product-form__group"]}>
          <label>Slug (URL)</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="Leave empty to auto-generate"
          />
        </div>

        <div
          className={`${styles["product-form__checkbox-card"]} ${
            formData.active ? styles["product-form__checkbox-card--active"] : ""
          }`}
        >
          <label>
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleCheckboxChange}
            />
            <span>Active Product</span>
          </label>
        </div>

        <div
          className={`${styles["product-form__checkbox-card"]} ${
            formData.isCustom
              ? styles["product-form__checkbox-card--active"]
              : ""
          }`}
        >
          <label>
            <input
              type="checkbox"
              name="isCustom"
              checked={formData.isCustom}
              onChange={handleCheckboxChange}
            />
            <span>Customizable (Designer)</span>
          </label>
        </div>
      </div>

      <div className={styles["product-form__actions"]}>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn--outline"
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? "Saving..." : "Save New Product"}
        </button>
      </div>
    </form>
  );
}
