import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionDetailClient from "./CollectionDetailClient";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  category: { id: string; name: string; slug: string } | null;
  images: string[];
  featuredImage: string | null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories/slug/${slug}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!res.ok) {
      console.error("[Collection] Failed to fetch category:", res.status);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("[Collection] Error fetching category:", error);
    return null;
  }
}

async function getProducts(
  categoryId: string,
  limit = 12
): Promise<{ products: Product[]; total: number }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?categoryId=${categoryId}&limit=${limit}&page=1`,
      {
        next: { revalidate: 600 }, // Cache for 10 minutes
      }
    );

    if (!res.ok) {
      console.error("[Collection] Failed to fetch products:", res.status);
      return { products: [], total: 0 };
    }

    const data = await res.json();

    // Handle both array and paginated response formats
    if (Array.isArray(data)) {
      return { products: data, total: data.length };
    }

    return {
      products: data.data || data,
      total: data.total || data.length,
    };
  } catch (error) {
    console.error("[Collection] Error fetching products:", error);
    return { products: [], total: 0 };
  }
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Collection Not Found | King Neon",
      description: "The requested collection could not be found.",
    };
  }

  const title = `${category.name} | Neon Sign Collection | King Neon`;
  const description =
    category.description ||
    `Browse our ${category.name} collection of premium LED neon signs. Custom designs, fast shipping.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: category.image ? [category.image] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: category.image ? [category.image] : [],
    },
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const { products: initialProducts, total: initialTotal } = await getProducts(
    category.id
  );

  // JSON-LD Structured Data for Collection
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description:
      category.description ||
      `Browse our ${category.name} collection of premium LED neon signs.`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://kingneon.com"}/collections/${slug}`,
    image: category.image || undefined,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: initialTotal,
      itemListElement: initialProducts.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://kingneon.com"}/products/${product.slug}`,
          image: product.images[0] || product.featuredImage || undefined,
          offers: {
            "@type": "Offer",
            price: product.basePrice,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CollectionDetailClient
        initialCategory={category}
        initialProducts={initialProducts}
        initialTotal={initialTotal}
      />
    </>
  );
}
