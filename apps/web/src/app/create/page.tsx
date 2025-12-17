import type { Metadata } from "next";
import NeonDesigner from "@/components/NeonDesigner";

export const metadata: Metadata = {
  title: "Create Your Own Custom Neon Sign | King Neon",
  description:
    "Design your perfect custom LED neon sign. Choose text, font, color, size, and more. Preview your design in real-time.",
};

export default function CreatePage() {
  return <NeonDesigner />;
}
