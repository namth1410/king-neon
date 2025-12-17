import type { Metadata } from "next";
import CollectionsClient from "./CollectionsClient";

export const metadata: Metadata = {
  title: "Neon Sign Collections | King Neon",
  description:
    "Browse our curated collections of premium LED neon signs. Wedding signs, business signs, home decor, and more.",
};

export default function CollectionsPage() {
  return <CollectionsClient />;
}
