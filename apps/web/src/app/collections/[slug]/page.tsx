import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionDetailClient from "./CollectionDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Format slug for display
  const formattedName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${formattedName} | Neon Sign Collection | King Neon`,
    description: `Browse our ${formattedName} collection of premium LED neon signs. Custom designs, fast shipping.`,
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return <CollectionDetailClient slug={slug} />;
}
