import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // In production, fetch product data here for dynamic metadata
  // For now, use slug-based title
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${title} | King Neon`,
    description: `Shop ${title} - Premium LED neon sign from King Neon. Handcrafted quality, free shipping available.`,
    openGraph: {
      title: `${title} | King Neon`,
      description: `Shop ${title} - Premium LED neon sign`,
      type: "website",
    },
  };
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
