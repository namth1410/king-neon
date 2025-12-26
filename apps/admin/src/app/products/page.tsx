"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { Spinner } from "@king-neon/ui";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import Pagination from "@/components/Pagination";
import api from "@/utils/api";
import { useApiRequest, withSignal } from "@/hooks/useApiRequest";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n/client";

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
  const limit = 3;

  const { request, abort, abortAll } = useApiRequest();
  const { t } = useTranslation("common");

  // Debounce search - abort pending request immediately when typing
  useEffect(() => {
    // Abort any pending products request immediately when user types
    abort("products");

    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, abort]);

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

      const response = await request("products", (signal) =>
        api.get("/products", withSignal(signal, { params }))
      );

      // Response is null if request was aborted
      if (!response) return;

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
      toast.error(t("products.error.loadFailed"));
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, categoryFilter, sortBy, request]);

  useEffect(() => {
    fetchProducts();
    return () => abortAll(); // Cleanup on unmount
  }, [fetchProducts, abortAll]);

  const handleDelete = async (id: string) => {
    if (confirm(t("products.deleteConfirm"))) {
      try {
        await api.delete(`/products/${id}`);
        toast.success(t("products.success.deleted"));
        fetchProducts();
      } catch (error) {
        console.error("Failed to delete product", error);
        toast.error(t("products.error.deleteFailed"));
      }
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  return (
    <DashboardLayout title={t("products.title")}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {t("products.management")}
            </h1>
            <p className="text-zinc-500 text-sm">
              {totalProducts} {t("products.inCatalog")}
            </p>
          </div>
          <Button asChild className="bg-pink-600 hover:bg-pink-700 gap-2">
            <Link href="/products/create">
              <Plus size={20} />
              {t("products.addProduct")}
            </Link>
          </Button>
        </div>

        {/* Filters Row */}
        <div className="flex gap-4 flex-wrap items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[400px]">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <Input
              type="text"
              placeholder={t("products.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-800/50 border-zinc-700"
            />
          </div>

          {/* Category Filter */}
          <Select
            onValueChange={handleCategoryChange}
            value={categoryFilter || "all"}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("products.allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("products.allCategories")}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select onValueChange={handleSortChange} value={sortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("products.sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">
                {t("products.newestFirst")}
              </SelectItem>
              <SelectItem value="name-asc">{t("products.nameAZ")}</SelectItem>
              <SelectItem value="name-desc">{t("products.nameZA")}</SelectItem>
              <SelectItem value="price-asc">
                {t("products.priceLowHigh")}
              </SelectItem>
              <SelectItem value="price-desc">
                {t("products.priceHighLow")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center text-zinc-500">
              <Spinner className="w-10 h-10 animate-spin mx-auto mb-4 text-pink-500" />
              {t("products.loadingProducts")}
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center">
              <Package size={48} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">{t("products.noProducts")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead>{t("products.table.product")}</TableHead>
                  <TableHead>{t("products.table.category")}</TableHead>
                  <TableHead>{t("products.table.price")}</TableHead>
                  <TableHead>{t("products.table.status")}</TableHead>
                  <TableHead>{t("products.table.type")}</TableHead>
                  <TableHead className="text-right">
                    {t("products.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-pink-500 font-bold text-sm">
                          {product.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {product.name}
                          </div>
                          <div className="text-xs text-zinc-500">
                            /{product.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-zinc-700 text-zinc-400"
                      >
                        {product.category?.name || t("common.noCategory")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-400 font-bold text-base">
                        ${Number(product.basePrice).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.active ? "success" : "destructive"}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            product.active ? "bg-green-400" : "bg-red-400"
                          }`}
                        />
                        {product.active
                          ? t("common.active")
                          : t("common.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.isCustom ? "info" : "secondary"}
                        className={
                          product.isCustom
                            ? "bg-purple-500/15 text-purple-400 border-purple-500/20"
                            : ""
                        }
                      >
                        {product.isCustom
                          ? t("products.type.custom")
                          : t("products.type.standard")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8"
                        >
                          <Link href={`/products/edit/${product.id}`}>
                            <Edit size={16} />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
