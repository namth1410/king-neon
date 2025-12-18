import type { Metadata } from "next";
import { Suspense } from "react";
import NeonDesigner from "@/components/NeonDesigner";

export const metadata: Metadata = {
  title: "Create Your Own Custom Neon Sign | King Neon",
  description:
    "Design your perfect custom LED neon sign. Choose text, font, color, size, and more. Preview your design in real-time.",
};

// Loading component for Suspense
function NeonDesignerLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        color: "#888",
      }}
    >
      Loading designer...
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<NeonDesignerLoading />}>
      <NeonDesigner />
    </Suspense>
  );
}
