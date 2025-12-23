"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../auth.module.scss";
import api from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Auto login after registration using useAuth hook
      const success = await login(formData.email, formData.password);

      if (success) {
        // Redirect to the original page or account
        router.push(redirectTo);
      } else {
        // Registration succeeded but login failed, redirect to login
        router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
      }
    } catch (err: unknown) {
      let message = "Registration failed";
      if (typeof err === "object" && err !== null && "response" in err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message = (err as any).response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.auth}>
      <div className={styles.auth__container}>
        <div className={styles.auth__card}>
          {/* Logo */}
          <div className={styles.auth__logo}>
            <Link href="/">KING NEON</Link>
          </div>

          {/* Header */}
          <div className={styles.auth__header}>
            <h1 className={styles.auth__title}>Create Account</h1>
            <p className={styles.auth__subtitle}>
              Join us and start creating your neon signs
            </p>
          </div>

          {/* Error */}
          {error && <div className={styles.auth__error}>{error}</div>}

          {/* Form */}
          <form className={styles.auth__form} onSubmit={handleSubmit}>
            <div className={styles.auth__field}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.auth__field}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.auth__field}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className={styles.auth__field}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn--primary btn--lg ${styles.auth__submit}`}
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className={styles.auth__footer}>
            Already have an account? <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
