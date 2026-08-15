import { ImageResponse } from "next/og";
import { AppIconTile } from "@/lib/app-icon-mark";

// No params and nothing request-dependent, so it can prerender once at
// build time like every other route here — without this, Next treats a
// route handler as dynamic (server-rendered per request) by default.
export const dynamic = "force-static";

// Android crops "maskable" icons to a circle/squircle and can cut up to
// ~20% off each edge, so this one gives the cupcake a bigger safe zone
// (smaller markRatio) than the plain "any"-purpose tile in
// icons/[size]/route.tsx — same gold gradient, just more headroom.
export async function GET() {
  return new ImageResponse(<AppIconTile size={512} markRatio={0.4} />, {
    width: 512,
    height: 512,
  });
}
