"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/utils/api";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  category: string;
  isActive: boolean;
  images: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      // Use mock data for now if empty or error
      if (response.data && response.data.length > 0) {
        setProducts(response.data);
      } else {
        // Fallback or empty state
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Failed to delete product", error);
        alert("Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Product Management">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-8">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#ff3366] transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#ff3366]/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#ff3366]/50 transition-all placeholder:text-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>
        <Link
          href="/products/create"
          className="flex items-center gap-2 px-6 py-3 bg-[#ff3366] hover:bg-[#ff3366]/90 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(255,51,102,0.3)] hover:shadow-[0_0_30px_rgba(255,51,102,0.5)] active:scale-95"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6 animate-bounce">
              <Search size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Get started by creating your first product."}
            </p>
            {!searchTerm && (
              <Link
                href="/products/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff3366] hover:bg-[#ff3366]/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-[#ff3366]/20"
              >
                <Plus size={20} />
                <span>Add Product</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white/5 flex-shrink-0 overflow-hidden border border-white/10 group-hover:border-[#ff3366]/30 transition-colors">
                          {product.images[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-base mb-0.5 group-hover:text-[#ff3366] transition-colors">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            /{product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                        {product.category || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          product.isActive
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${product.isActive ? "bg-green-500" : "bg-red-500"}`}
                        ></span>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-bold font-mono">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {product.quantity} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/products/edit/${product.id}`}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
