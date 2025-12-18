"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Package, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/utils/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    category: Category | null;
    productCount: number;
  }>({ open: false, category: null, productCount: 0 });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast.error("Failed to load categories");
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (category: Category) => {
    try {
      // Check product count first
      const res = await api.get(`/categories/${category.id}/products/count`);
      setDeleteModal({
        open: true,
        category,
        productCount: res.data.count,
      });
    } catch (err) {
      console.error("Failed to check product count:", err);
      toast.error("Failed to check product count");
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.category) return;

    try {
      await api.delete(`/categories/${deleteModal.category.id}`);
      setCategories((prev) =>
        prev.filter((c) => c.id !== deleteModal.category?.id)
      );
      toast.success("Category deleted successfully");
      setDeleteModal({ open: false, category: null, productCount: 0 });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <DashboardLayout title="Categories">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "white" }}>
              Categories
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>
              Manage your product categories
            </p>
          </div>
          <Link
            href="/categories/create"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
              color: "white",
              borderRadius: "0.75rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            <Plus size={20} />
            Add Category
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div
            style={{
              padding: "1rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "0.75rem",
              color: "#ef4444",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "1rem",
              border: "1px dashed rgba(255,255,255,0.1)",
            }}
          >
            <Package
              size={48}
              style={{ color: "rgba(255,255,255,0.3)", marginBottom: "1rem" }}
            />
            <p style={{ color: "rgba(255,255,255,0.5)" }}>No categories yet</p>
            <Link
              href="/categories/create"
              style={{
                color: "#ec4899",
                marginTop: "0.5rem",
                display: "inline-block",
              }}
            >
              Create your first category
            </Link>
          </div>
        ) : (
          /* Categories Grid */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                style={{
                  background: "rgba(20,20,20,0.4)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        color: "white",
                        fontWeight: 600,
                        fontSize: "1.125rem",
                      }}
                    >
                      {category.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "monospace",
                      }}
                    >
                      /{category.slug}
                    </span>
                  </div>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      background: category.active
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(239,68,68,0.1)",
                      color: category.active ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {category.active ? "Active" : "Inactive"}
                  </span>
                </div>

                {category.description && (
                  <p
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.875rem",
                      marginBottom: "1rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {category.description}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <Link
                    href={`/categories/edit/${category.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      padding: "0.5rem 1rem",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "0.5rem",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.875rem",
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                  >
                    <Edit2 size={14} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(category)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      padding: "0.5rem 1rem",
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: "0.5rem",
                      color: "#ef4444",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.open && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
            }}
            onClick={() =>
              setDeleteModal({ open: false, category: null, productCount: 0 })
            }
          >
            <div
              style={{
                background: "#1a1a1a",
                borderRadius: "1rem",
                padding: "2rem",
                maxWidth: "400px",
                width: "90%",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {deleteModal.productCount > 0 ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <AlertCircle size={24} style={{ color: "#f59e0b" }} />
                    <h3 style={{ color: "white", fontWeight: 600 }}>
                      Cannot Delete Category
                    </h3>
                  </div>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: "1.5rem",
                    }}
                  >
                    The category{" "}
                    <strong>&quot;{deleteModal.category?.name}&quot;</strong> is
                    used by{" "}
                    <strong>{deleteModal.productCount} product(s)</strong>.
                    Please reassign these products to another category before
                    deleting.
                  </p>
                  <button
                    onClick={() =>
                      setDeleteModal({
                        open: false,
                        category: null,
                        productCount: 0,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "rgba(255,255,255,0.1)",
                      border: "none",
                      borderRadius: "0.5rem",
                      color: "white",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Got it
                  </button>
                </>
              ) : (
                <>
                  <h3
                    style={{
                      color: "white",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Delete Category?
                  </h3>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: "1.5rem",
                    }}
                  >
                    Are you sure you want to delete{" "}
                    <strong>&quot;{deleteModal.category?.name}&quot;</strong>?
                    This action cannot be undone.
                  </p>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          open: false,
                          category: null,
                          productCount: 0,
                        })
                      }
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        background: "rgba(255,255,255,0.1)",
                        border: "none",
                        borderRadius: "0.5rem",
                        color: "white",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        background: "#ef4444",
                        border: "none",
                        borderRadius: "0.5rem",
                        color: "white",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
