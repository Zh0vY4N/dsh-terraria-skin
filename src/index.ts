/**
 * dsh-terraria-skin — host half.
 *
 * This skin is deliberately pure-client: the palette recolor, the Terraria
 * ambience layer and the slime pet all run in the browser and need no host
 * service, settings section or persistence. The host half exists only so the
 * bundle row has a stable Cordis anchor; keep it empty.
 *
 * Install a local checkout with `dsh plugin --profile web add link:<path>`;
 * once published, `dsh plugin --profile web add dsh-terraria-skin`.
 * @module dsh-terraria-skin
 */
import type { Context } from '@deepseek-ai/cordis'

/** Stable Cordis plugin name — matches the cordis.patch.yml insert id. */
export const name = 'terraria-skin'

/** No host services are required. */
export const inject: string[] = []

/**
 * No-op host apply. All skinning happens in the './client' entry, whose
 * lifecycle is scoped to this same Cordis plugin row.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => undefined, 'terraria-skin: host no-op')
}
