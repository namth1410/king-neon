import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://king-neon.com";

  // Các trang tĩnh chính của website
  const routes = ["", "/about", "/products", "/create", "/collections/all"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: route === "" ? 1 : 0.8,
    })
  );

  // TODO: Sau này có thể fetch danh sách sản phẩm từ API để thêm vào sitemap
  // const products = await getProducts();
  // const productUrls = ...

  return [...routes];
}
