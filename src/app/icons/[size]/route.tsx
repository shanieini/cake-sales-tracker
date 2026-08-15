import { ImageResponse } from "next/og";
import { AppIconTile } from "@/lib/app-icon-mark";

// The two sizes manifest.ts asks for under icons[].purpose "any" — Chrome's
// installability check wants at least a 192 and a 512. A dynamic route
// rather than two near-identical files, since it's the same tile at two
// pixel counts.
const SIZES = [192, 512] as const;

export function generateStaticParams() {
  return SIZES.map((size) => ({ size: String(size) }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params;
  const px = SIZES.includes(Number(size) as (typeof SIZES)[number])
    ? Number(size)
    : 512;
  return new ImageResponse(<AppIconTile size={px} />, {
    width: px,
    height: px,
  });
}
