import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/teachers",
    "/how-it-works",
    "/become-a-teacher",
    "/about",
    "/trust",
    "/contact",
    "/faq",
    "/training",
    "/terms",
    "/privacy",
  ];
  return paths.map((path) => ({
    url: `https://merit.local${path}`,
    lastModified: new Date(),
  }));
}
