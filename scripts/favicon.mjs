/**
 * Generate favicon.ico + apple-icon.png dari app/icon.svg.
 *
 * sharp merender gradient dengan benar (ImageMagick sering gagal pada
 * gradient SVG), dan densitas 300 memberi hasil tajam saat di-downscale.
 *
 * Jalankan: node scripts/favicon.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"
import pngToIco from "png-to-ico"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const src = path.join(root, "app", "icon.svg")

const svg = fs.readFileSync(src)

const render = (size) =>
  sharp(svg, { density: 300 }).resize(size, size).png().toBuffer()

const icoSizes = [16, 32, 48]
const ico = await pngToIco(await Promise.all(icoSizes.map(render)))
fs.writeFileSync(path.join(root, "app", "favicon.ico"), ico)

const apple = await render(180)
fs.writeFileSync(path.join(root, "app", "apple-icon.png"), apple)

console.log(
  `favicon.ico  ${icoSizes.join(", ")}px  ${(ico.length / 1024).toFixed(1)} KB`
)
console.log(`apple-icon.png  180px  ${(apple.length / 1024).toFixed(1)} KB`)
