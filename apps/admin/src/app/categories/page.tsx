"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Package, AlertCircle } from "lucide-react";
import { Spinner } from "@king-neon/ui";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/i18n/client";

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
  const { t } = useTranslation("common");

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
      toast.error(t("categories.error.loadFailed"));
      setError(t("categories.error.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (category: Category) => {
    try {
      const res = await api.get(`/categories/${category.id}/products/count`);
      setDeleteModal({
        open: true,
        category,
        productCount: res.data.count,
      });
    } catch (err) {
      console.error("Failed to check product count:", err);
      toast.error(t("categories.error.checkProductCount"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.category) return;

    try {
      await api.delete(`/categories/${deleteModal.category.id}`);
      setCategories((prev) =>
        prev.filter((c) => c.id !== deleteModal.category?.id)
      );
      toast.success(t("categories.success.deleted"));
      setDeleteModal({ open: false, category: null, productCount: 0 });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message || t("categories.error.deleteFailed")
      );
    }
  };

  return (
    <DashboardLayout title={t("categories.title")}>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {t("categories.title")}
            </h1>
            <p className="text-zinc-500 text-sm">
              {t("categories.description")}
            </p>
          </div>
          <Button asChild className="bg-pink-600 hover:bg-pink-700 gap-2">
            <Link href="/categories/create">
              <Plus size={20} />
              {t("categories.addCategory")}
            </Link>
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="p-16 text-center text-zinc-500">
            <Spinner className="w-10 h-10 animate-spin mx-auto mb-4 text-pink-500" />
            {t("categories.loading")}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center p-16 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
            <Package size={48} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">{t("categories.noCategories")}</p>
            <Link
              href="/categories/create"
              className="text-pink-500 mt-2 inline-block"
            >
              {t("categories.createFirst")}
            </Link>
          </div>
        ) : (
          /* Categories Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="bg-zinc-900/50 border-zinc-800"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-white">
                        {category.name}
                      </CardTitle>
                      <span className="text-xs text-zinc-500 font-mono">
                        /{category.slug}
                      </span>
                    </div>
                    <Badge
                      variant={category.active ? "success" : "destructive"}
                    >
                      {category.active
                        ? t("common.active")
                        : t("common.inactive")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {category.description && (
                    <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="flex gap-2 pt-4 border-t border-zinc-800">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-zinc-700 gap-1"
                    >
                      <Link href={`/categories/edit/${category.id}`}>
                        <Edit2 size={14} />
                        {t("common.edit")}
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1"
                      onClick={() => handleDeleteClick(category)}
                    >
                      <Trash2 size={14} />
                      {t("common.delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.open && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() =>
              setDeleteModal({ open: false, category: null, productCount: 0 })
            }
          >
            <div
              className="bg-zinc-900 rounded-xl p-6 max-w-md w-[90%] border border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              {deleteModal.productCount > 0 ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle size={24} className="text-yellow-500" />
                    <h3 className="text-white font-semibold">
                      {t("categories.cannotDelete")}
                    </h3>
                  </div>
                  <p className="text-zinc-400 mb-6">
                    {t("categories.usedByProducts", {
                      name: deleteModal.category?.name,
                      count: deleteModal.productCount,
                    })}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-zinc-700"
                    onClick={() =>
                      setDeleteModal({
                        open: false,
                        category: null,
                        productCount: 0,
                      })
                    }
                  >
                    {t("common.gotIt")}
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-white font-semibold mb-2">
                    {t("categories.deleteCategory")}
                  </h3>
                  <p className="text-zinc-400 mb-6">
                    {t("categories.deleteConfirm", {
                      name: deleteModal.category?.name,
                    })}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-zinc-700"
                      onClick={() =>
                        setDeleteModal({
                          open: false,
                          category: null,
                          productCount: 0,
                        })
                      }
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={confirmDelete}
                    >
                      {t("common.delete")}
                    </Button>
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
