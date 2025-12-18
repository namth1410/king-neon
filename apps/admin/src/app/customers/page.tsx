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
import toast from "react-hot-toast";
import DashboardLayout from "@/components/DashboardLayout";
import Pagination from "@/components/Pagination";
import api from "@/utils/api";

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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await api.get("/users", { params });

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
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  return (
    <DashboardLayout title="Customers">
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
              Customer Management
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
              {totalUsers} customers registered
            </p>
          </div>
        </div>

        {/* Filters */}
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
              placeholder="Search by name or email..."
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

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
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
              minWidth: "130px",
            }}
          >
            <option value="all" style={{ background: "#1a1a1a" }}>
              All Roles
            </option>
            <option value="customer" style={{ background: "#1a1a1a" }}>
              Customer
            </option>
            <option value="admin" style={{ background: "#1a1a1a" }}>
              Admin
            </option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
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
              minWidth: "130px",
            }}
          >
            <option value="all" style={{ background: "#1a1a1a" }}>
              All Status
            </option>
            <option value="active" style={{ background: "#1a1a1a" }}>
              Active
            </option>
            <option value="inactive" style={{ background: "#1a1a1a" }}>
              Inactive
            </option>
          </select>
        </div>

        {/* Table */}
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
              Loading customers...
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <Users
                size={48}
                style={{ color: "rgba(255,255,255,0.2)", marginBottom: "16px" }}
              />
              <p style={{ color: "rgba(255,255,255,0.5)" }}>
                No customers found
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Contact</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Joined</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
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
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #ff3366 0%, #a855f7 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "14px",
                          }}
                        >
                          {user.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div style={{ color: "white", fontWeight: 600 }}>
                            {user.name}
                          </div>
                          <div
                            style={{
                              color: "rgba(255,255,255,0.4)",
                              fontSize: "12px",
                            }}
                          >
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            color: "rgba(255,255,255,0.7)",
                            fontSize: "13px",
                          }}
                        >
                          <Mail
                            size={14}
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              color: "rgba(255,255,255,0.5)",
                              fontSize: "12px",
                            }}
                          >
                            <Phone
                              size={12}
                              style={{ color: "rgba(255,255,255,0.3)" }}
                            />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          background:
                            user.role === "admin"
                              ? "rgba(168,85,247,0.1)"
                              : "rgba(59,130,246,0.1)",
                          border: `1px solid ${user.role === "admin" ? "rgba(168,85,247,0.3)" : "rgba(59,130,246,0.3)"}`,
                          color: user.role === "admin" ? "#a855f7" : "#3b82f6",
                          fontSize: "12px",
                          textTransform: "capitalize",
                        }}
                      >
                        {user.role}
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
                          background: user.isActive
                            ? "rgba(34,197,94,0.1)"
                            : "rgba(239,68,68,0.1)",
                          border: `1px solid ${user.isActive ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                          color: user.isActive ? "#22c55e" : "#ef4444",
                          fontSize: "12px",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "currentColor",
                          }}
                        />
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "13px",
                        }}
                      >
                        <Calendar
                          size={14}
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        title={user.isActive ? "Deactivate" : "Activate"}
                        style={{
                          padding: "8px",
                          borderRadius: "8px",
                          background: user.isActive
                            ? "rgba(239,68,68,0.1)"
                            : "rgba(34,197,94,0.1)",
                          border: "none",
                          color: user.isActive ? "#ef4444" : "#22c55e",
                          cursor: "pointer",
                          display: "inline-flex",
                        }}
                      >
                        {user.isActive ? (
                          <UserX size={16} />
                        ) : (
                          <UserCheck size={16} />
                        )}
                      </button>
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
