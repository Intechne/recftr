import assert from "node:assert/strict";
import { createRequire } from "node:module";
import sharp from "sharp";

// Exercise Next's actual image processing path after the Sharp security override.
// This uses a generated fixture and never processes uploads or accesses the network.
const require = createRequire(import.meta.url);
const { optimizeImage } = require("next/dist/server/image-optimizer");
const png = await sharp({
  create: { width: 32, height: 24, channels: 3, background: "#10192f" },
}).png().toBuffer();

for (const [contentType, format] of [
  ["image/webp", "webp"],
  ["image/avif", "heif"],
  ["image/jpeg", "jpeg"],
]) {
  const output = await optimizeImage({ buffer: png, contentType, width: 16, quality: 75 });
  const metadata = await sharp(output).metadata();
  assert.equal(metadata.width, 16);
  assert.equal(metadata.height, 12);
  assert.equal(metadata.format, format);
  assert.equal((await sharp(output).raw().toBuffer()).length, 16 * 12 * 3);
  console.log(`PASS Next.js image optimizer: ${contentType}, 16×12, decoded successfully`);
}

console.log(`Sharp ${sharp.versions.sharp}; libheif ${sharp.versions.heif}`);
