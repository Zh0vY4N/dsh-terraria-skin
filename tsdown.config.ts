import { defineConfig } from 'tsdown'

/**
 * Builds two ESM entries:
 *  - lib/index.js   host half (name/inject/apply, no host surface)
 *  - lib/client.js  browser half (the skin engine), served to the web plugin
 *                   roster through the package.json `dsh.client` manifest.
 */
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    client: 'src/client/index.ts',
  },
  format: ['esm'],
  clean: true,
  sourcemap: true,
})
