import { ImageResponse } from "next/og";
import { AppIconTile } from "@/lib/app-icon-mark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Next's file-based icon convention — this becomes the browser-tab favicon.
// Same black tile + cupcake mark as everywhere else in the app (see
// src/lib/app-icon-mark.tsx), so there's one source of truth for the logo
// instead of a hand-exported PNG to keep in sync.
export default function Icon() {
  return new ImageResponse(<AppIconTile size={32} radius={8} />, size);
}
