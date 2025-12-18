import type { Metadata } from "next";
import ProductDetailClient, { Product } from "./ProductDetailClient";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const res = await fetch(`${apiUrl}/products/slug/${slug}`, {
      // Revalidate data every hour
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching product for SEO:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | King Neon",
      description: "The requested neon sign could not be found.",
    };
  }

  const title = product.name;
  const description =
    product.description ||
    `Buy ${product.name} LED Neon Sign. High quality, affordable custom neon signs.`;
  const mainImage =
    product.images?.[0] ||
    product.featuredImage ||
    "https://king-neon.com/placeholder.jpg";

  return {
    title: `${title} | King Neon`,
    description: description.slice(0, 160), // SEO meta description max length
    openGraph: {
      title: `${title} | King Neon`,
      description: description.slice(0, 200),
      images: [
        {
          url: mainImage,
          width: 800,
          height: 600,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description.slice(0, 200),
      images: [mainImage],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return <ProductDetailClient />;
  }

  // JSON-LD for Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: "King Neon",
    },
    offers: {
      "@type": "Offer",
      url: `https://king-neon.com/products/${product.slug}`,
      priceCurrency: "USD",
      price: product.basePrice,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.active
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient initialProduct={product} />
    </>
  );
}
