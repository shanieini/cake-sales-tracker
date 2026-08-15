import { ImageResponse } from "next/og";
import { AppIconTile } from "@/lib/app-icon-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Next's file-based icon convention — becomes the iOS home-screen icon when
// the app is added via Safari's share sheet. No rounding: iOS applies its
// own squircle mask over whatever square it's given, so a plain full-bleed
// tile is what Apple's own guidance asks for.
export default function AppleIcon() {
  return new ImageResponse(<AppIconTile size={180} />, size);
}
