// dsh-terraria-skin: build the browser half into the DSH client-module
// registration artifact. The client module system executes every plugin
// bundle as a classic script and expects it to call
//   window.__ModuleLoader__.load({ id, factory })
// where factory(require) returns the module exports (apply/inject). A plain
// ESM file (tsdown esm output) never registers and fails with
//   "loaded without registering ... via __ModuleLoader__.load".
//
// We bundle src/client/index.ts with rolldown in CJS form (react/react-dom
// stay external, resolved through the loader's injected require), then wrap
// the emitted CJS body in the factory closure exactly like the reference
// bundles (aionui-panel, ba-click-fx):
//
//   window.__ModuleLoader__.load({
//     id: "dsh-terraria-skin",
//     factory: (require) => {
//       var module = { exports: {} };
//       var exports = module.exports;
//       <bundled cjs body>          // exports.apply / exports.inject land here
//       return module.exports;
//     }
//   });

import { rolldown } from 'rolldown'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ID = 'dsh-terraria-skin'

const bundler = await rolldown({
  input: resolve(ROOT, 'src/client/index.ts'),
  // React and ReactDOM are provided by the web GUI's module table; the
  // loader require answers them. Never inline them.
  external: ['react', 'react-dom', 'react-dom/client', /^react(\/|$)/],
  resolve: { extensions: ['.ts', '.tsx', '.mjs', '.js', '.json'] },
})

const { output } = await bundler.generate({
  format: 'cjs',
  sourcemap: false,
  exports: 'named',
})
const body = output[0].code

const banner = `window.__ModuleLoader__.load({\n\tid: ${JSON.stringify(ID)},\n\tfactory: (require) => {\n\t\tvar module = { exports: {} };\n\t\tvar exports = module.exports;\n`
const footer = `\n\t\treturn module.exports;\n\t}\n});\n`
const clientBundle = `${banner}${body}${footer}`

const outPath = resolve(ROOT, 'lib/client.js')
await mkdir(dirname(outPath), { recursive: true })
await writeFile(outPath, clientBundle)

console.log(`built ${outPath} (${clientBundle.length} bytes)`)
