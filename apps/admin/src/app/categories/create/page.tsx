"use client";

import { useState } from "react";
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

export default function CreateCategoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

      await api.post("/categories", {
        ...formData,
        image: uploadedImageUrl,
        sortOrder: parseInt(String(formData.sortOrder)) || 0,
      });
      toast.success("Category created successfully");
      router.push("/categories");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to create category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Category">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Categories
        </Link>

        <form onSubmit={handleSubmit}>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-white font-semibold text-lg mb-6">
              Category Details
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., LED Neon Signs"
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Slug *
                </label>
                <Input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  required
                  placeholder="e.g., led-neon-signs"
                  className="bg-zinc-800/50 border-zinc-700"
                />
                <p className="text-xs text-zinc-500">
                  URL-friendly identifier (auto-generated from name)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of this category..."
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-pink-500 resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    Icon
                  </label>
                  <Input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    placeholder="e.g., neon"
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    Sort Order
                  </label>
                  <Input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleChange}
                    min="0"
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
              </div>

              {/* Category Image */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Category Image
                </label>
                <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
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
                <p className="text-xs text-zinc-500">
                  Image for the category gallery display
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
                <span className="text-zinc-300">Active</span>
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, active: checked }))
                  }
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end mt-8 pt-6 border-t border-zinc-800">
              <Button variant="outline" asChild className="border-zinc-700">
                <Link href="/categories">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-pink-600 hover:bg-pink-700 gap-2"
              >
                {isLoading && <Spinner className="w-4 h-4 animate-spin" />}
                {isLoading ? "Creating..." : "Create Category"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
