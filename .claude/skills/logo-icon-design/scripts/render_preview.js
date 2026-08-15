#!/usr/bin/env node
// Renders an SVG file through a real browser (not just reasoned about as markup) at one
// or more pixel sizes, plus a single labeled contact sheet so a small-size legibility
// check is one image instead of several. This is how the logo-icon-design skill closes
// the "no eye, only geometry" gap — actually look at the rendered PNG before calling an
// icon/logo done, the same way a human designer would glance at it in a canvas.
//
// Usage:
//   node render_preview.js <input.svg> <output-dir> [sizes]
//   sizes defaults to "16,32,48,128,512" (px, comma-separated)
//
// Requires Playwright's Node package + a downloaded Chromium build. Both are already
// present in this environment (PLAYWRIGHT_BROWSERS_PATH is preset). If either is missing
// elsewhere, this script fails loudly with a clear message — the skill should report that
// the visual-render step is unavailable rather than skip it silently or fake a result.

const fs = require("fs");
const path = require("path");

function resolvePlaywright() {
  try {
    return require("playwright");
  } catch {
    // Fall back to the environment's global install (this container's `npm ls -g`
    // location) in case the project itself doesn't have playwright as a dependency.
    const globalPath = "/opt/node22/lib/node_modules/playwright";
    if (fs.existsSync(globalPath)) return require(globalPath);
    throw new Error(
      "Playwright is not installed (checked local node_modules and " +
        globalPath +
        "). Cannot render a real preview in this environment — say so explicitly " +
        "rather than skipping this check silently.",
    );
  }
}

function resolveChromiumExecutable() {
  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (browsersPath && fs.existsSync(browsersPath)) {
    const dirs = fs
      .readdirSync(browsersPath)
      .filter((d) => d.startsWith("chromium-"));
    if (dirs.length > 0) {
      const candidate = path.join(
        browsersPath,
        dirs.sort().reverse()[0],
        "chrome-linux",
        "chrome",
      );
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return undefined; // let Playwright fall back to its own default resolution
}

async function main() {
  const [, , inputSvg, outDir, sizesArg] = process.argv;
  if (!inputSvg || !outDir) {
    console.error(
      "Usage: node render_preview.js <input.svg> <output-dir> [sizes=16,32,48,128,512]",
    );
    process.exit(1);
  }
  const sizes = (sizesArg || "16,32,48,128,512")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  const svgAbsPath = path.resolve(inputSvg);
  if (!fs.existsSync(svgAbsPath)) {
    console.error(`Input SVG not found: ${svgAbsPath}`);
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });

  // Inline as a data URI rather than pointing <img src> at a file:// path — a page loaded
  // via page.setContent() has no file:// origin of its own, and Chromium silently refuses
  // to load file:// resources from it (renders as a broken-image icon, not an error). A
  // data URI sidesteps that entirely.
  const svgDataUri = `data:image/svg+xml;base64,${fs
    .readFileSync(svgAbsPath)
    .toString("base64")}`;

  const { chromium } = resolvePlaywright();
  const executablePath = resolveChromiumExecutable();
  const browser = await chromium.launch(
    executablePath ? { executablePath } : {},
  );

  try {
    const pngPaths = [];
    for (const size of sizes) {
      const page = await browser.newPage({
        viewport: { width: size, height: size },
      });
      // Wrapping in <img> (rather than navigating to the .svg file directly) makes the
      // browser rasterize at the *displayed* size regardless of the SVG's own declared
      // width/height/viewBox — so one master SVG renders crisply at every requested size.
      await page.setContent(
        `<!doctype html><html><head><style>
          html,body{margin:0;padding:0;background:transparent}
          img{display:block;width:${size}px;height:${size}px}
        </style></head><body>
          <img src="${svgDataUri}">
        </body></html>`,
        { waitUntil: "load" },
      );
      const outPath = path.join(outDir, `preview-${size}.png`);
      await page.screenshot({ path: outPath, omitBackground: true });
      await page.close();
      pngPaths.push({ size, outPath });
      console.log(`Rendered ${size}x${size} -> ${outPath}`);
    }

    // Contact sheet: every size laid out left-to-right on a mid-gray + checkerboard split
    // background (so both light-glyph and dark-glyph icons stay visible), labeled with
    // its pixel size. This is the one image worth actually looking at for the small-size
    // legibility check — no need to open every individual PNG by hand.
    const gap = 24;
    const labelH = 20;
    const sheetPage = await browser.newPage();
    const cellHtml = pngPaths
      .map(({ size, outPath }) => {
        const dataUri = `data:image/png;base64,${fs.readFileSync(outPath).toString("base64")}`;
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <div style="width:${Math.max(size, 48)}px;height:${Math.max(size, 48)}px;
              display:flex;align-items:center;justify-content:center;
              background:
                linear-gradient(45deg,#ccc 25%,transparent 25%),
                linear-gradient(-45deg,#ccc 25%,transparent 25%),
                linear-gradient(45deg,transparent 75%,#ccc 75%),
                linear-gradient(-45deg,transparent 75%,#ccc 75%);
              background-size:10px 10px;background-position:0 0,0 5px,5px -5px,-5px 0;
              background-color:#fff;border-radius:4px">
            <img src="${dataUri}" style="width:${size}px;height:${size}px">
          </div>
          <div style="font:12px monospace;color:#333">${size}px</div>
        </div>`;
      })
      .join("");
    const sheetWidth =
      pngPaths.reduce((sum, { size }) => sum + Math.max(size, 48) + gap, 0) +
      gap;
    const sheetHeight = Math.max(...pngPaths.map((p) => Math.max(p.size, 48))) + labelH + gap * 2;
    await sheetPage.setViewportSize({
      width: Math.ceil(sheetWidth),
      height: Math.ceil(sheetHeight),
    });
    await sheetPage.setContent(
      `<!doctype html><html><head><style>
        html,body{margin:0;padding:${gap}px;background:#f5f5f5;
          font-family:-apple-system,sans-serif}
      </style></head><body>
        <div style="display:flex;gap:${gap}px;align-items:flex-end">${cellHtml}</div>
      </body></html>`,
      { waitUntil: "load" },
    );
    const contactSheetPath = path.join(outDir, "contact-sheet.png");
    await sheetPage.screenshot({ path: contactSheetPath });
    await sheetPage.close();
    console.log(`Contact sheet -> ${contactSheetPath}`);
    console.log(
      "\nNow actually read/view the contact sheet image before calling this done " +
        "(e.g. via the Read tool on contact-sheet.png) — that's the whole point of this script.",
    );
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
