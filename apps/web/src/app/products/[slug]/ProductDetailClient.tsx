"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Check,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import api from "@/utils/api";
import RelatedProducts from "@/components/RelatedProducts/RelatedProducts";
import styles from "./ProductDetail.module.scss";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  category: { id: string; name: string; slug: string } | null;
  isCustom: boolean;
  options: Record<string, unknown> | null;
  active: boolean;
  images: string[];
  featuredImage: string | null;
}

interface ProductDetailClientProps {
  initialProduct?: Product | null;
}

export default function ProductDetailPage({
  initialProduct,
}: ProductDetailClientProps) {
  const params = useParams();
  const slug = params.slug as string;
  const dispatch = useDispatch();

  const [product, setProduct] = useState<Product | null>(
    initialProduct || null
  );
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    // If we already have the product (passed from server) and slugs match, don't refetch
    if (initialProduct && initialProduct.slug === slug) {
      return;
    }

    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/products/slug/${slug}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch product", err);
        setError("Product not found");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug, initialProduct]);

  const handleAddToCart = () => {
    if (!product) return;

    dispatch(
      addToCart({
        id: product.id,
        type: "product",
        name: product.name,
        price: product.basePrice,
        quantity,
        image: product.images[0] || product.featuredImage || "",
      })
    );

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const nextImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setSelectedImage(
        (prev) => (prev - 1 + product.images.length) % product.images.length
      );
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.errorContainer}>
        <h1>Product Not Found</h1>
        <p>
          The product you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link href="/collections" className={styles.backButton}>
          Browse Collections
        </Link>
      </div>
    );
  }

  const images =
    product.images.length > 0
      ? product.images
      : [product.featuredImage || "/placeholder.jpg"];

  return (
    <div className={styles.productPage}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/collections">Collections</Link>
        <span>/</span>
        <span className={styles.current}>{product.name}</span>
      </nav>

      <div className={styles.productContainer}>
        {/* Image Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.image}
              priority
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className={styles.navButton}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className={`${styles.navButton} ${styles.next}`}
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className={styles.thumbnails}>
              {images.map((img, index) => (
                <button
                  key={index}
                  className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ""}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={styles.productInfo}>
          <div className={styles.category}>
            {product.category?.name?.toUpperCase() || "UNCATEGORIZED"}
          </div>
          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.priceContainer}>
            <span className={styles.price} suppressHydrationWarning>
              ${Number(product.basePrice).toFixed(2)}
            </span>
            {product.isCustom && (
              <span className={styles.customBadge}>Customizable</span>
            )}
          </div>

          <p className={styles.description}>{product.description}</p>

          {/* Quantity Selector */}
          <div className={styles.quantitySection}>
            <label>Quantity</label>
            <div className={styles.quantitySelector}>
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus size={18} />
              </button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}>
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button
              className={`${styles.addToCart} ${addedToCart ? styles.added : ""}`}
              onClick={handleAddToCart}
            >
              {addedToCart ? (
                <>
                  <Check size={20} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  Add to Cart
                </>
              )}
            </button>
            <button className={styles.wishlist} aria-label="Add to wishlist">
              <Heart size={20} />
            </button>
            <button className={styles.share} aria-label="Share product">
              <Share2 size={20} />
            </button>
          </div>

          {/* Product Features */}
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.icon}>✨</span>
              <div>
                <strong>Premium Quality</strong>
                <p>Handcrafted LED neon with 50,000+ hours lifespan</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.icon}>🚚</span>
              <div>
                <strong>Free Shipping</strong>
                <p>Free delivery on orders over $100</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.icon}>🔧</span>
              <div>
                <strong>Easy Installation</strong>
                <p>Mounting kit included with every sign</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        currentProductId={product.id}
        category={product.category?.slug || ""}
      />
    </div>
  );
}
