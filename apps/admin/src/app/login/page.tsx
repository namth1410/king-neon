"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.scss";
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

    // Basic validation
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

      // Check for admin role
      if (user.role !== "admin" && user.role !== "super_admin") {
        setError("Unauthorized access. Admin privileges required.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("admin_token", accessToken);
      localStorage.setItem("admin_user", JSON.stringify(user));

      // Redirect to dashboard
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
    <div className={styles.login}>
      <div className={styles.login__card}>
        <div className={styles.login__logo}>
          <h1>KING NEON</h1>
          <span>ADMINISTRATION</span>
        </div>

        {error && <div className={styles.login__error}>{error}</div>}

        <form className={styles.login__form} onSubmit={handleSubmit}>
          <div className={styles.login__field}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="admin@kingneon.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.login__field}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={styles.login__submit}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
