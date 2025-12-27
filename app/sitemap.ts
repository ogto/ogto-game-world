import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://ogto-game-world.vercel.app/",
      lastModified: new Date(),
    },
    {
      url: "https://ogto-game-world.vercel.app/games/dodge-jump",
      lastModified: new Date(),
    },
    {
      url: "https://ogto-game-world.vercel.app/games/dodge-jump/intro",
      lastModified: new Date(),
    },
  ];
}
