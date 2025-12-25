import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://apnisec.com";

  return [
    "",
    "/login",
    "/register",
    "/dashboard",
    "/profile",
    "/forgot-password",
  ].map((path) => ({
    url: `${baseUrl}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
