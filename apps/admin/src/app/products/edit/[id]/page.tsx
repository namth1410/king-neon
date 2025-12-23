"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Spinner } from "@king-neon/ui";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import ImageUpload, { PendingFile } from "@/components/ImageUpload";
import api from "@/utils/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value === "none" ? "" : value,
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

    try {
      const newImageUrls = await uploadPendingFiles();
      const allImages = [...formData.images, ...newImageUrls];

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

      pendingFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setPendingFiles([]);

      toast.success("Product updated successfully");
      router.push("/products");
    } catch (err) {
      console.error("Failed to update product:", err);
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Product">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner className="w-10 h-10 animate-spin text-pink-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Product">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/products")}
            className="border border-zinc-800"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Product</h1>
            <p className="text-zinc-500 text-sm">Update product information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  Product Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Good Vibes Only"
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  URL Slug *
                </label>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    placeholder="good-vibes-only"
                    className="bg-zinc-800/50 border-zinc-700 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSlug}
                    className="border-zinc-700"
                  >
                    Generate
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Product description..."
                  className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-pink-500 resize-y"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Base Price ($) *
                  </label>
                  <Input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="199.00"
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Category
                  </label>
                  <Select
                    onValueChange={handleCategoryChange}
                    value={formData.categoryId || "none"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="w-5 h-5 accent-pink-500 rounded"
                  />
                  <span className="text-zinc-300">
                    Active (visible in store)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isCustom"
                    checked={formData.isCustom}
                    onChange={handleChange}
                    className="w-5 h-5 accent-purple-500 rounded"
                  />
                  <span className="text-zinc-300">Custom Product</span>
                </label>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  Product Images
                </label>
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
            </div>

            {/* Submit */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/products")}
                className="border-zinc-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-pink-600 hover:bg-pink-700 gap-2"
              >
                {saving ? (
                  <>
                    <Spinner className="w-4 h-4 animate-spin" />
                    {pendingFiles.length > 0
                      ? "Uploading & Saving..."
                      : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
