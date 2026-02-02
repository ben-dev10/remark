import { siteConfig } from "@/utils/lib/site";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "", // for private or protected routes
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
