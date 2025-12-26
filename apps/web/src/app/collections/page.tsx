import type { Metadata } from "next";
import CollectionsClient from "./CollectionsClient";

export const metadata: Metadata = {
  title: "Neon Sign Collections | King Neon",
  description:
    "Browse our curated collections of premium LED neon signs. Wedding signs, business signs, home decor, and more.",
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories/active`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!res.ok) {
      console.error("[Collections] Failed to fetch categories:", res.status);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("[Collections] Error fetching categories:", error);
    return [];
  }
}

export default async function CollectionsPage() {
  const categories = await getCategories();
  return <CollectionsClient initialCategories={categories} />;
}
