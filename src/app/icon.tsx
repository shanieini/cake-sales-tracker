import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Next's file-based icon convention (this becomes the favicon) — the gold
// tile from the header badge/splash, rendered at icon size via ImageResponse
// rather than a static file, so there's one source of truth for "gold tile +
// cake" instead of a hand-exported PNG to keep in sync.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          background: "linear-gradient(135deg, #d9ac4f, #c99a3c)",
          borderRadius: 8,
        }}
      >
        🎂
      </div>
    ),
    size,
  );
}
