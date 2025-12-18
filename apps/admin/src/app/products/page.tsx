"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Package, Filter } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/DashboardLayout";
import Pagination from "@/components/Pagination";
import api from "@/utils/api";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  category: { id: string; name: string; slug: string } | null;
  active: boolean;
  images: string[];
  featuredImage: string | null;
  isCustom: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        sortBy,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (categoryFilter) params.categoryId = categoryFilter;

      const response = await api.get("/products", { params });

      if (response.data.data) {
        setProducts(response.data.data);
        setTotalProducts(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        const productsData = Array.isArray(response.data) ? response.data : [];
        setProducts(productsData);
        setTotalProducts(productsData.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, categoryFilter, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        console.error("Failed to delete product", error);
        toast.error("Failed to delete product");
      }
    }
  };

  // Reset page when filters change
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  return (
    <DashboardLayout title="Products">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "white",
                marginBottom: "4px",
              }}
            >
              Product Management
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
              {products.length} products in catalog
            </p>
          </div>
          <Link
            href="/products/create"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "linear-gradient(135deg, #ff3366 0%, #ff3366cc 100%)",
              borderRadius: "12px",
              color: "white",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(255,51,102,0.3)",
            }}
          >
            <Plus size={20} />
            Add Product
          </Link>
        </div>

        {/* Filters Row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div
            style={{
              position: "relative",
              flex: "1",
              minWidth: "200px",
              maxWidth: "400px",
            }}
          >
            <Search
              size={20}
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.4)",
              }}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 48px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "white",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ position: "relative" }}>
            <Filter
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.4)",
                pointerEvents: "none",
              }}
            />
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={{
                padding: "12px 16px 12px 36px",
                paddingRight: "40px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "white",
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
                appearance: "none",
                minWidth: "160px",
              }}
            >
              <option value="" style={{ background: "#1a1a1a" }}>
                All Categories
              </option>
              {categories.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                  style={{ background: "#1a1a1a" }}
                >
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            style={{
              padding: "12px 16px",
              paddingRight: "40px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "white",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              appearance: "none",
              minWidth: "150px",
            }}
          >
            <option value="newest" style={{ background: "#1a1a1a" }}>
              Newest First
            </option>
            <option value="name-asc" style={{ background: "#1a1a1a" }}>
              Name A-Z
            </option>
            <option value="name-desc" style={{ background: "#1a1a1a" }}>
              Name Z-A
            </option>
            <option value="price-asc" style={{ background: "#1a1a1a" }}>
              Price: Low to High
            </option>
            <option value="price-desc" style={{ background: "#1a1a1a" }}>
              Price: High to Low
            </option>
          </select>
        </div>

        {/* Products Table */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <div
              style={{
                padding: "60px",
                textAlign: "center",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid rgba(255,51,102,0.2)",
                  borderTopColor: "#ff3366",
                  borderRadius: "50%",
                  margin: "0 auto 16px",
                  animation: "spin 1s linear infinite",
                }}
              />
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <Package
                size={48}
                style={{ color: "rgba(255,255,255,0.2)", marginBottom: "16px" }}
              />
              <p style={{ color: "rgba(255,255,255,0.5)" }}>
                No products found
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <th style={thStyle}>Product</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Price</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Type</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "8px",
                            background:
                              "linear-gradient(135deg, rgba(255,51,102,0.2) 0%, rgba(147,51,234,0.2) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ff3366",
                            fontWeight: 700,
                            fontSize: "14px",
                          }}
                        >
                          {product.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div
                            style={{
                              color: "white",
                              fontWeight: 600,
                              marginBottom: "2px",
                            }}
                          >
                            {product.name}
                          </div>
                          <div
                            style={{
                              color: "rgba(255,255,255,0.4)",
                              fontSize: "12px",
                            }}
                          >
                            /{product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.7)",
                          fontSize: "12px",
                          textTransform: "capitalize",
                        }}
                      >
                        {product.category?.name || "No Category"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          color: "#22c55e",
                          fontWeight: 700,
                          fontSize: "16px",
                        }}
                      >
                        ${Number(product.basePrice).toFixed(2)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          background: product.active
                            ? "rgba(34,197,94,0.1)"
                            : "rgba(239,68,68,0.1)",
                          border: `1px solid ${product.active ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                          color: product.active ? "#22c55e" : "#ef4444",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: product.active ? "#22c55e" : "#ef4444",
                          }}
                        />
                        {product.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          background: product.isCustom
                            ? "rgba(168,85,247,0.1)"
                            : "rgba(59,130,246,0.1)",
                          border: `1px solid ${product.isCustom ? "rgba(168,85,247,0.3)" : "rgba(59,130,246,0.3)"}`,
                          color: product.isCustom ? "#a855f7" : "#3b82f6",
                          fontSize: "12px",
                        }}
                      >
                        {product.isCustom ? "Custom" : "Standard"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Link
                          href={`/products/edit/${product.id}`}
                          style={{
                            padding: "8px",
                            borderRadius: "8px",
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.6)",
                            display: "flex",
                          }}
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          style={{
                            padding: "8px",
                            borderRadius: "8px",
                            background: "rgba(239,68,68,0.1)",
                            color: "#ef4444",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalProducts}
            itemsOnPage={products.length}
            limit={limit}
            onPageChange={setPage}
            itemName="products"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

const thStyle: React.CSSProperties = {
  padding: "16px 20px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 600,
  color: "rgba(255,255,255,0.5)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tdStyle: React.CSSProperties = {
  padding: "16px 20px",
};
