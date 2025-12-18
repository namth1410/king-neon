import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";

export const metadata: Metadata = {
  title: "King Neon - Custom LED Neon Signs",
  description:
    "Create stunning custom LED neon signs for your home, business, or special event. Handcrafted quality, free shipping, and easy installation.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <Categories />
    </>
  );
}
