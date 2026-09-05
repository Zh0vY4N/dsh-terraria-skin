// Re-embed assets/wallpaper.jpg into src/client/index.ts after you swap the
// picture. Usage: node scripts/encode-assets.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const img = readFileSync(join(root, 'assets', 'wallpaper.jpg'))
const b64 = img.toString('base64')
const file = join(root, 'src', 'client', 'index.ts')
const src = readFileSync(file, 'utf8')
const marker = 'const WALL = '
const i = src.indexOf(marker)
if (i < 0) throw new Error('WALL marker not found')
const end = src.indexOf('\n', i)
const out = src.slice(0, i) + marker + "'" + b64 + "'" + src.slice(end)
writeFileSync(file, out)
console.log('wallpaper re-embedded (' + b64.length + ' chars)')
