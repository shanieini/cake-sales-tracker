#!/usr/bin/env node
// Packs one or more square PNGs into a real multi-resolution .ico file — the format
// favicon.ico actually needs (a small container of images at different sizes), which is
// NOT the same thing as a PNG saved with a ".ico" extension. No native/ImageMagick/Pillow
// dependency: modern .ico files are allowed to embed raw PNG data per entry (supported by
// every current browser and by Windows since Vista), so this is pure Node.
//
// Usage:
//   node build_ico.js <output.ico> <size1.png> [size2.png] [...]
// Typical:
//   node build_ico.js favicon.ico preview-16.png preview-32.png preview-48.png
//
// Pair with render_preview.js: render your master SVG at 16/32/(48) via that script first,
// then feed those exact PNGs in here so the .ico matches what you already visually checked.

const fs = require("fs");

function readPngDimensions(buf) {
  // PNG IHDR chunk: bytes 16-23 (after 8-byte signature + 4-byte length + 4-byte "IHDR")
  // are width (u32 BE) then height (u32 BE).
  if (buf.length < 24 || buf.toString("ascii", 12, 16) !== "IHDR") {
    throw new Error("Not a valid PNG (missing IHDR chunk)");
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function buildIco(pngPaths) {
  const entries = pngPaths.map((p) => {
    const data = fs.readFileSync(p);
    const { width, height } = readPngDimensions(data);
    if (width !== height) {
      throw new Error(`${p} is ${width}x${height} — ico entries must be square`);
    }
    if (width > 256) {
      throw new Error(`${p} is ${width}px — ico entries must be <= 256px per side`);
    }
    return { data, size: width };
  });

  if (entries.length === 0) throw new Error("No PNG inputs given");

  const dirHeaderSize = 6;
  const entryHeaderSize = 16;
  const dirTotalSize = dirHeaderSize + entryHeaderSize * entries.length;

  const header = Buffer.alloc(dirHeaderSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(entries.length, 4); // image count

  let offset = dirTotalSize;
  const dirEntries = [];
  for (const { data, size } of entries) {
    const entry = Buffer.alloc(entryHeaderSize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256px)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height (0 = 256px)
    entry.writeUInt8(0, 2); // color palette count (0 = no palette, true color)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel (32 = RGBA)
    entry.writeUInt32LE(data.length, 8); // size of this image's data
    entry.writeUInt32LE(offset, 12); // offset from start of file
    dirEntries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...dirEntries, ...entries.map((e) => e.data)]);
}

function main() {
  const [, , outPath, ...pngPaths] = process.argv;
  if (!outPath || pngPaths.length === 0) {
    console.error(
      "Usage: node build_ico.js <output.ico> <size1.png> [size2.png] [...]",
    );
    process.exit(1);
  }
  const ico = buildIco(pngPaths);
  fs.writeFileSync(outPath, ico);
  console.log(
    `Wrote ${outPath} (${pngPaths.length} image${pngPaths.length > 1 ? "s" : ""}, ${ico.length} bytes)`,
  );
}

main();
