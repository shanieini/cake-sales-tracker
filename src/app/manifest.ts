import type { MetadataRoute } from "next";
import { cakeStrings } from "@/lib/strings";

// Next's file-based manifest convention — serves this at
// /manifest.webmanifest and links it in <head> automatically. This, plus
// the icons below, is what turns "Add to Home Screen" from a bookmark into
// a real install: its own icon, no browser address bar, and a matching
// launch background instead of a flash of white.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: cakeStrings.title,
    short_name: cakeStrings.title,
    description: "מעקב אחרי מכירות עוגות, הוצאות, ודוח מכירות חודשי ושנתי.",
    lang: "he",
    dir: "rtl",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f3ecdc",
    theme_color: "#1c1a17",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
