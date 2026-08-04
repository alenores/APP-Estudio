/**
 * Genera íconos PWA desde design/app-icon-source.svg (libro).
 * El SVG se lee como texto UTF-8 y se pasa a sharp por Buffer (evita fallos de encoding).
 */
import sharp from "sharp";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SVG_PATH = path.join(ROOT, "design", "app-icon-source.svg");

function loadSvgBuffer() {
  if (!existsSync(SVG_PATH)) {
    throw new Error("Falta design/app-icon-source.svg");
  }
  const text = readFileSync(SVG_PATH, "utf8").replace(/^\uFEFF/, "");
  return Buffer.from(text, "utf8");
}

async function squareAppIcon(side, svgBuffer, outputPath) {
  await sharp(svgBuffer)
    .resize(side, side, { fit: "cover", position: "center" })
    .png({ compressionLevel: 9, effort: 9 })
    .toFile(outputPath);
}

async function browserTabIcon(svgBuffer, outputPath) {
  await sharp(svgBuffer)
    .resize(128, 128, { fit: "cover", position: "center" })
    .png({ compressionLevel: 9, effort: 9 })
    .toFile(outputPath);
}

async function main() {
  const svgBuffer = loadSvgBuffer();
  const pub = path.join(ROOT, "public");
  const appDir = path.join(ROOT, "app");
  mkdirSync(pub, { recursive: true });
  mkdirSync(path.join(ROOT, "design"), { recursive: true });

  await squareAppIcon(512, svgBuffer, path.join(pub, "icon-512x512.png"));
  await squareAppIcon(192, svgBuffer, path.join(pub, "icon-192x192.png"));
  await squareAppIcon(512, svgBuffer, path.join(pub, "logo-identidad.png"));
  await browserTabIcon(svgBuffer, path.join(appDir, "icon.png"));
  await squareAppIcon(180, svgBuffer, path.join(appDir, "apple-icon.png"));
  await squareAppIcon(512, svgBuffer, path.join(ROOT, "design", "app-icon-source.png"));

  // Asegura que el SVG en disco quede UTF-8 limpio.
  writeFileSync(SVG_PATH, svgBuffer.toString("utf8"), "utf8");

  console.log("OK · source design/app-icon-source.svg (libro)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
