"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/utils/api";

export default function CreateProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    quantity: "",
    category: "",
    description: "",
    isActive: true,
    images: [] as string[],
  });

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
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, you would upload images first and get URLs
      // For now, we'll send the data as is or mock image URLs if needed

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 0,
      };

      await api.post("/products", payload);
      router.push("/products");
    } catch (error) {
      console.error("Failed to create product", error);
      alert("Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Product">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Products</span>
        </Link>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-medium text-white">
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Product Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-[#ff3366] focus:outline-none transition-colors"
                      placeholder="e.g. Neon Heart Sign"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="slug"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Slug
                    </label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      required
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-[#ff3366] focus:outline-none transition-colors"
                      placeholder="e.g. neon-heart-sign"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-[#ff3366] focus:outline-none transition-colors resize-none"
                      placeholder="Product description..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-medium text-white">Media</h3>

                <div className="border-2 border-dashed border-[#333] rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-[#ff3366] hover:text-[#ff3366] transition-colors cursor-pointer bg-[#1a1a1a]/50">
                  <Upload size={32} className="mb-4" />
                  <p className="font-medium">Click to upload image</p>
                  <p className="text-sm text-gray-500 mt-1">
                    SVG, PNG, JPG or GIF (max. 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing & Organization */}
            <div className="space-y-6">
              <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-medium text-white">Status</h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active</span>
                  <button
                    type="button"
                    onClick={handleToggleActive}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? "bg-green-500" : "bg-gray-600"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-medium text-white">
                  Pricing & Inventory
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Price ($)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-[#ff3366] focus:outline-none transition-colors"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-[#ff3366] focus:outline-none transition-colors"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-medium text-white">Organization</h3>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-[#ff3366] focus:outline-none transition-colors"
                  >
                    <option value="">Select category...</option>
                    <option value="text-signs">Text Signs</option>
                    <option value="shapes">Shapes & Icons</option>
                    <option value="business">Business</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-[#222]">
            <Link
              href="/products"
              className="px-6 py-2.5 border border-[#333] rounded-lg text-gray-300 hover:text-white hover:bg-[#222] transition-colors font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#ff3366] hover:bg-[#ff3366]/90 text-white rounded-lg font-medium transition-colors shadow-[0_0_20px_rgba(255,51,102,0.3)] hover:shadow-[0_0_30px_rgba(255,51,102,0.5)]"
            >
              {isLoading ? "creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
