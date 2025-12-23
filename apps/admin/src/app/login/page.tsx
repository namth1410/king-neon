"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/utils/api";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { email, password } = formData;
    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { accessToken, user } = response.data;

      if (user.role !== "admin" && user.role !== "super_admin") {
        setError("Unauthorized access. Admin privileges required.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("admin_token", accessToken);
      localStorage.setItem("admin_user", JSON.stringify(user));

      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      let message = "Login failed. Please check your credentials.";

      if (typeof err === "object" && err !== null && "message" in err) {
        message = (err as { message: string }).message;
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight">
              KING{" "}
              <span
                className="text-pink-500"
                style={{ textShadow: "0 0 20px rgba(255,51,102,0.5)" }}
              >
                NEON
              </span>
            </CardTitle>
            <p className="text-xs font-semibold uppercase tracking-widest text-pink-500/80 border border-pink-500/20 bg-pink-500/10 inline-block px-2 py-0.5 rounded">
              Administration
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-300"
              >
                Email Address
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="admin@kingneon.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="bg-zinc-800/50 border-zinc-700 focus:border-pink-500 focus:ring-pink-500/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-zinc-300"
              >
                Password
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="bg-zinc-800/50 border-zinc-700 focus:border-pink-500 focus:ring-pink-500/20"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2.5"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
