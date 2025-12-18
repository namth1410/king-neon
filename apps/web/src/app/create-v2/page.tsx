import type { Metadata } from "next";
import NeonConfigurator3D from "@/components/NeonConfigurator3D";

export const metadata: Metadata = {
  title: "Create Neon V2 (3D) | King Neon",
  description:
    "Design your custom neon sign in 3D. Rotate, customize and preview your creation in real-time.",
};

export default function CreateV2Page() {
  return <NeonConfigurator3D />;
}
