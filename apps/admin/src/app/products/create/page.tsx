"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@king-neon/ui";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/utils/api";
import ImageUpload, { PendingFile } from "@/components/ImageUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

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

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value === "none" ? "" : value,
    }));
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
      <div className="max-w-4xl">
        {/* Header */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Products
        </Link>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">
                      Product Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Neon Heart Sign"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">
                      Slug (URL)
                    </label>
                    <Input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      required
                      placeholder="e.g. neon-heart-sign"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Product description..."
                      rows={4}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-200 placeholder:text-zinc-500 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-zinc-900 resize-y transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Media</h3>
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
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Status</h3>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Active Status</span>
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, active: checked }))
                    }
                  />
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Pricing</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Base Price ($)
                  </label>
                  <Input
                    type="number"
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

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Organization</h3>
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
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end mt-6">
            <Button variant="outline" asChild>
              <Link href="/products">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="w-4 h-4 animate-spin" />}
              {isLoading ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
