# dsh-terraria-skin 🟩⛏️

Terraria-themed skin plugin for the **DSH web GUI**. Unofficial fan theme — sprite art is original game art (terraria.wiki.gg), no affiliation with Re-Logic.

> 泰拉瑞亚主题的 DSH 网页端皮肤（非官方粉丝主题）：深色玻璃质感 + 自选壁纸 + 史莱姆宠物生态（击杀→天上刷新，11 个原版物种，右侧史莱姆王击杀统计）。

## What you get

- **Frosted dark skin** — the plugin is *static* (like `@linxin666/dsh-pet`), so it runs with full DOM access: it injects a global stylesheet that maps the whole `--dsw-alias-*` palette onto a translucent dark glass look (cool blue-grey surfaces on top of the wallpaper), and **forces the dark theme** so everyone gets the intended look without touching DSH theme settings (restored on disable).
- **Your own wallpaper** — `assets/wallpaper.jpg` is embedded and painted on the page background. Low-alpha glass panels let it glow through with real detail. Swap it anytime (see Customise).
- **Slime ecosystem** (bottom-right, draggable):
  - 单击 = 击杀：史莱姆压扁并渐隐（**名牌同步淡出**）→ 一只**随机物种的新史莱姆从天空掉落**（落地回弹，名牌淡入）
  - **11 个原版物种**（绿/蓝/冰雪/尖刺/紫/腐化/猩红/熔岩/黄金/粉红/彩虹，均为 wiki 原图内嵌、离线可用），掉落**分级钱币**（铜→银→金，彩虹/粉红最富），大部分还会掉原版**凝胶 Gel**
  - 右键手动切换物种；按住拖拽移动
- **Right-side loot column** (above the pet): **史莱姆王 King Slime 击杀计数** + 金币（金/银/铜图标）+ 凝胶计数。
- Drop FX are **anchored to the pet**, never offset from it (dragged or corner-anchored alike).

## How it differs from an in-session plugin

In-session (chat) plugins are sandboxed — their styles can only reach their own overlay subtree, so they **cannot** repaint the page background/tokens. A **static dsh plugin** runs outside that guard: it mounts onto `document.body` and owns a global stylesheet. This repo is that real, publishable version.

> The browser half is shipped as the DSH **client-module artifact**: the bundle must register itself via `window.__ModuleLoader__.load({ id, factory })`. A plain ESM build fails with `loaded without registering ... via __ModuleLoader__.load` — that is why the client entry is built with `scripts/build-client.mjs` (see Develop).

## Repo layout

```
├─ package.json             # npm package + dsh plugin manifest (dsh.client / dsh.bundle.patch)
├─ cordis.patch.yml         # inserts the terraria-skin row into the web plugin roster
├─ tsconfig.json / tsdown.config.ts
├─ assets/                  # sprites + wallpaper.jpg (source art, also embedded in client)
├─ scripts/
│   ├─ encode-assets.mjs    # re-embed assets/wallpaper.jpg into src/client/index.ts
│   └─ build-client.mjs     # bundle src/client/index.ts into the __ModuleLoader__ client artifact
├─ src/index.ts             # host half (no-op anchor)
└─ src/client/index.ts      # skin engine: token remap + wallpaper + pet + right loot column
```

## Install into DSH

```bash
# from this checkout (after pnpm i && pnpm build)
dsh plugin --profile web add link:/path/to/dsh-terraria-skin
# or from npm once published
dsh plugin --profile web add dsh-terraria-skin
```

## Develop

```bash
pnpm install
pnpm typecheck   # tsc --noEmit
pnpm build       # tsdown (host index) && node scripts/build-client.mjs (client ModuleLoader bundle)
```

Node ^22.19 / >=24, React 18 peer, DSH rc.6 peer types (`@deepseek-ai/cordis`, `@deepseek-ai/dsh-client-runtime`).

## Customise

- **Wallpaper**: drop your own picture into `assets/wallpaper.jpg` (a fairly **dark** image works best with the dark glass look), then run `node scripts/encode-assets.mjs` and rebuild. A wide-but-light image will look washed out under the glass — aim for ~1600px wide and a mid-to-dark exposure.
- **Species / drops / token remap**: edit `SPECIES` and the `T` / `DG` / `LG` tables in `src/client/index.ts`.
- **Look & feel**: surfaces are translucent so the wallpaper shows through — raise/lower the `DG` (dark) and `LG` alphas to taste.

## License & disclaimer

MIT (code). Terraria © Re-Logic; this fan project uses no redistributable game assets beyond sprite images for personal/demonstration use. Not affiliated with Re-Logic.
