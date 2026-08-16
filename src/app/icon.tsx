import { ImageResponse } from "next/og";
import { AppIconTile } from "@/lib/app-icon-mark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Next's file-based icon convention — this becomes the browser-tab favicon.
// Same tile + cake mark as everywhere else in the app (see
// src/lib/app-icon-mark.tsx), so there's one source of truth for the logo
// instead of a hand-exported PNG to keep in sync.
//
// A larger markRatio than the other surfaces get: at 32px, the mark's own
// outline strokes are only ~1px wide at the default 0.56 ratio and wash out
// under PNG rasterization — sized up so the linework actually survives at
// the smallest size this app ships (see logo-icon-design skill).
export default function Icon() {
  return new ImageResponse(
    <AppIconTile size={32} radius={8} markRatio={0.72} />,
    size,
  );
}
