/**
 * Genera íconos PWA desde design/app-icon-source.* o crea uno por defecto (gradiente).
 */
import sharp from "sharp";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const SOURCE_CANDIDATES = [
  path.join(ROOT, "design", "app-icon-source.png"),
  path.join(ROOT, "design", "app-icon-source.jpg"),
  path.join(ROOT, "design", "app-icon-source.jpeg"),
];

function resolveSourcePath() {
  for (const p of SOURCE_CANDIDATES) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function createDefaultSource(outputPath) {
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4f46e5"/>
          <stop offset="100%" style="stop-color:#312e81"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="96" fill="url(#g)"/>
      <text x="256" y="290" font-family="Arial,sans-serif" font-size="120" font-weight="bold"
        fill="white" text-anchor="middle">AE</text>
    </svg>`;
  mkdirSync(path.dirname(outputPath), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  return outputPath;
}

async function squareAppIcon(side, inputPath, outputPath) {
  await sharp(inputPath)
    .rotate()
    .resize(side, side, { fit: "cover", position: "center" })
    .png({ compressionLevel: 9, effort: 9 })
    .toFile(outputPath);
}

async function browserTabIcon(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(128, 128, { fit: "cover", position: "center" })
    .png({ compressionLevel: 9, effort: 9 })
    .toFile(outputPath);
}

async function headerLogo(inputPath, outputPath) {
  await sharp(inputPath)
    .rotate()
    .resize(512, 512, { fit: "cover", position: "center" })
    .png({ compressionLevel: 9, effort: 9 })
    .toFile(outputPath);
}

async function main() {
  let src = resolveSourcePath();
  if (!src) {
    const defaultPath = path.join(ROOT, "design", "app-icon-source.png");
    console.log("Sin design/app-icon-source.* — generando ícono por defecto.");
    src = await createDefaultSource(defaultPath);
  }

  const pub = path.join(ROOT, "public");
  const appDir = path.join(ROOT, "app");
  mkdirSync(pub, { recursive: true });

  await squareAppIcon(512, src, path.join(pub, "icon-512x512.png"));
  await squareAppIcon(192, src, path.join(pub, "icon-192x192.png"));
  await headerLogo(src, path.join(pub, "logo-identidad.png"));

  const logoPath = path.join(pub, "logo-identidad.png");
  await browserTabIcon(logoPath, path.join(appDir, "icon.png"));
  await squareAppIcon(180, src, path.join(appDir, "apple-icon.png"));

  console.log(`OK · source ${path.relative(ROOT, src)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
