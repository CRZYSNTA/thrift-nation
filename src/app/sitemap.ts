import type { MetadataRoute } from "next";
import { getCollections, getProducts } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://thriftnation.in";

  const [products, collections] = await Promise.all([
    getProducts(),
    getCollections(),
  ]);

  const staticRoutes = [
    "",
    "/men",
    "/women",
    "/new-arrivals",
    "/collections",
    "/about",
    "/contact",
    "/policies/shipping",
    "/policies/returns",
    "/policies/privacy",
    "/policies/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  const collectionRoutes = collections.map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: new Date(),
  }));

  const productRoutes = products.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}

