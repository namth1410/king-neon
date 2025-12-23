"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
} from "lucide-react";
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

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  role: "customer" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;

  const { request, abort, abortAll } = useApiRequest();

  // Debounce search - abort pending request immediately when typing
  useEffect(() => {
    abort("users");

    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, abort]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await request("users", (signal) =>
        api.get("/users", withSignal(signal, { params }))
      );

      // Response is null if request was aborted
      if (!response) return;

      if (response.data.data) {
        setUsers(response.data.data);
        setTotalUsers(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        const userData = Array.isArray(response.data) ? response.data : [];
        setUsers(userData);
        setTotalUsers(userData.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load customers");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, roleFilter, statusFilter, request]);

  useEffect(() => {
    fetchUsers();
    return () => abortAll();
  }, [fetchUsers, abortAll]);

  const handleToggleStatus = async (user: User) => {
    try {
      await api.patch(`/users/${user.id}`, { isActive: !user.isActive });
      toast.success(`Customer ${user.isActive ? "deactivated" : "activated"}`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update customer status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <DashboardLayout title="Customers">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Customer Management
            </h1>
            <p className="text-zinc-500 text-sm">
              {totalUsers} customers registered
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px] max-w-[400px]">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <Select onValueChange={handleRoleChange} value={roleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={handleStatusChange} value={statusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center text-zinc-500">
              <Spinner className="w-10 h-10 animate-spin mx-auto mb-4 text-pink-500" />
              Loading customers...
            </div>
          ) : users.length === 0 ? (
            <div className="p-16 text-center">
              <Users size={48} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">No customers found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                          {user.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {user.name}
                          </div>
                          <div className="text-xs text-zinc-500">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                          <Mail size={14} className="text-zinc-600" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                            <Phone size={12} className="text-zinc-600" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "admin" ? "info" : "secondary"}
                        className={
                          user.role === "admin"
                            ? "bg-purple-500/15 text-purple-400 border-purple-500/20"
                            : ""
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "success" : "destructive"}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            user.isActive ? "bg-green-400" : "bg-red-400"
                          }`}
                        />
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                        <Calendar size={14} className="text-zinc-600" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${
                          user.isActive
                            ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            : "text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        }`}
                        onClick={() => handleToggleStatus(user)}
                        title={user.isActive ? "Deactivate" : "Activate"}
                      >
                        {user.isActive ? (
                          <UserX size={16} />
                        ) : (
                          <UserCheck size={16} />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalUsers}
            itemsOnPage={users.length}
            limit={limit}
            onPageChange={setPage}
            itemName="customers"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
