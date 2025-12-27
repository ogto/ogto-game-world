import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://ogto.games/",
      lastModified: new Date(),
    },
    {
      url: "https://ogto.games/games/dodge-jump",
      lastModified: new Date(),
    },
    {
      url: "https://ogto.games/games/dodge-jump/intro",
      lastModified: new Date(),
    },
  ];
}
