import type { Metadata } from "next";
import { Suspense } from "react";
import NeonConfigurator3D from "@/components/NeonConfigurator3D";

export const metadata: Metadata = {
  title: "Create Neon V2 (3D) | King Neon",
  description:
    "Design your custom neon sign in 3D. Rotate, customize and preview your creation in real-time.",
  alternates: {
    canonical: "/create-v2",
  },
};

// Loading fallback component
function LoadingFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom, #0a0a0f, #1a1a2e)",
        color: "#fff",
        gap: "20px",
      }}
    >
      {/* Animated neon-style loading */}
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "3px solid rgba(255, 51, 102, 0.2)",
          borderTopColor: "#ff3366",
          animation: "spin 1s linear infinite",
        }}
      />
      <p style={{ color: "#ff3366", fontSize: "18px", fontWeight: 500 }}>
        Loading 3D Editor...
      </p>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Preparing your creative space
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function CreateV2Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NeonConfigurator3D />
    </Suspense>
  );
}
