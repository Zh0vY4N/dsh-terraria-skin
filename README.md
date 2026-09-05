# dsh-terraria-skin 🟩⛏️

Terraria-themed skin plugin for the **DSH web GUI**. Unofficial fan theme — all art is original game sprites (terraria.wiki.gg), no affiliation with Re-Logic.

> 泰拉瑞亚主题的 DSH 网页端皮肤（非官方粉丝主题）：全局可读配色 + 内嵌「微光海洋」壁纸 + 一个会“击杀→天上刷新”的史莱姆生态（11 个原版物种）。

## What you get

- **Global skin** — the plugin is *static* (like `@linxin666/dsh-pet`), so it runs with full DOM access: it injects a global stylesheet that remaps the whole `--dsw-alias-*` palette to a readable Terraria look (light = warm parchment & dark brown text; dark = cavern navy/gold & cream text), and paints the **Shimmer Ocean wallpaper** on the page background with translucent surfaces so it glows through — in BOTH themes. Nothing overlays or blocks the UI.
- **Slime ecosystem** (right side of the screen):
  - 单击 = 击杀：史莱姆压扁并渐隐 → 一只**随机物种的新史莱姆从天空掉落**（落地回弹）
  - **11 个原版物种**（绿/蓝/冰雪/尖刺/紫/腐化/猩红/熔岩/黄金/粉红/彩虹，均为 wiki 原图内嵌、离线可用），掉落**分级钱币**（铜→银→金，彩虹/粉红最富），大部分还会掉原版**凝胶 Gel**（真图标 + 计数）
  - 右键手动切换物种；按住拖拽移动
  - 左下角钱袋用原版钱币图标实时累计
- Coin/gel drop FX are **anchored to the pet**, never offset from it (dragged or corner-anchored alike).

## How it differs from an in-session plugin

In-session (chat) plugins are sandboxed — their styles can only reach their own overlay subtree, so they **cannot** repaint the page background/tokens (that is why a wallpaper demo inside a chat session never shows). A **static dsh plugin** runs outside that guard: it mounts onto `document.body` and owns a global stylesheet. This repo is that real, publishable version.

## Repo layout

```
├─ package.json        # npm package + dsh plugin manifest (dsh.client / dsh.bundle.patch)
├─ cordis.patch.yml    # inserts the terraria-skin row into the web plugin roster
├─ tsconfig.json / tsdown.config.ts
├─ assets/             # original sprites + wallpaper.jpg (source art, also embedded)
├─ src/index.ts        # host half (no-op anchor)
└─ src/client/index.ts # full skin engine (global palette + wallpaper + slime ecosystem)
```

## Install into DSH

```bash
# from this checkout (after pnpm i && pnpm build)
dsh plugin --profile web add link:/path/to/dsh-terraria-skin
# or from npm once published
dsh plugin --profile web add dsh-terraria-skin
```

## Publish with your own GitHub account

1. Create an empty repository on GitHub (e.g. `dsh-terraria-skin`).
2. Set the remote URL in this folder:

```bash
git init
git add -A
git commit -m "feat: Terraria skin for DSH web GUI"
git branch -M main
git remote add origin https://github.com/<your-account>/dsh-terraria-skin.git
git push -u origin main
```

3. (Optional) npm publish after editing `name` if you want a scoped name: `pnpm publish`.

## Develop

```bash
pnpm install
pnpm typecheck   # tsc --noEmit
pnpm build       # tsdown -> lib/index.js + lib/client.js
```

Node ^22.19 / >=24, React 18 peer, DSH rc.6 peer types (`@deepseek-ai/cordis`, `@deepseek-ai/dsh-client-runtime`).

## Customise

- **Wallpaper**: drop your own Terraria fan-art into `assets/wallpaper.jpg`, then re-encode it into the client with `node scripts/encode-assets.mjs` (see below) — or simply swap the picture and keep the embedded one.
- **Species/drops**: edit `SPECIES` in `src/client/index.ts`.

## License & disclaimer

MIT (code). Terraria © Re-Logic; this fan project uses no redistributable game assets beyond sprite images for personal/demonstration use. Not affiliated with Re-Logic.
