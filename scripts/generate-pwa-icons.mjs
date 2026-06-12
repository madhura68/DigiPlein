// Genereert de PWA-/apple-icon-PNG's uit het merk (oranje vlak + zwarte "D").
// De "D" is een PAD (geen <text>) zodat de rendering font-onafhankelijk en
// reproduceerbaar is. Het vlak loopt door tot de rand → maskable-safe (de OS-mask
// rondt de hoeken). Eenmalig/na merk-wijziging draaien: `npm run icons`.
import { mkdir } from 'node:fs/promises'

import sharp from 'sharp'

const D_PATH =
  'M139 130 L239 130 C329 130 373 188 373 256 C373 324 329 382 239 382 L139 382 Z M217 186 L239 186 C289 186 303 218 303 256 C303 294 289 326 239 326 L217 326 Z'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" fill="#ee7203"/><path fill-rule="evenodd" d="${D_PATH}" fill="#000000"/></svg>`

const buf = Buffer.from(svg)
await mkdir('public/icons', { recursive: true })

await sharp(buf).resize(192, 192).png().toFile('public/icons/icon-192.png')
await sharp(buf).resize(512, 512).png().toFile('public/icons/icon-512.png')
await sharp(buf).resize(180, 180).png().toFile('public/apple-icon.png')

console.log(
  'PWA-icons gegenereerd: public/icons/icon-{192,512}.png + public/apple-icon.png'
)
