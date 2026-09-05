/**
 * dsh-terraria-skin — browser half (final architecture).
 *
 * A static dsh plugin runs OUTSIDE the dynamic-package Guard, so it has full
 * DOM access: like @linxin666/dsh-pet it mounts one React root onto
 * `document.body` and injects a global stylesheet. That is what makes a real
 * SKIN possible — body-level alias token overrides (readable in both themes),
 * translucent surfaces, and the embedded Shimmer wallpaper on the page
 * background — none of which the sandboxed in-session plugins could touch.
 *
 * Gameplay (all art = original Terraria sprites from terraria.wiki.gg,
 * embedded as data URIs so the package works offline):
 *  - kill a slime: it squashes & fades, then a NEW random species falls from
 *    the sky (bounce on landing);
 *  - 11 real species with graduated coin drops (copper→silver→gold) plus Gel
 *    drops (real Gel sprite + counter);
 *  - right-click cycles species, drag moves the pet.
 * The coin/gel counters live at bottom-left using the original coin icons.
 * @module dsh-terraria-skin/client
 */
import { createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'

/** No injected services are required. */
export const inject: string[] = []

/* ------------------------------------------------------------------ */
/* Terraria GUI token remap (light = warm parchment, dark = cavern)    */
/* ------------------------------------------------------------------ */
const T = {
  '--dsw-alias-bg-base': { l: '#f2e8cc', d: '#0a0f19' }, '--dsw-alias-bg-layer-1': { l: '#f9f1dc', d: '#131a2a' }, '--dsw-alias-bg-layer-2': { l: '#f1e6c8', d: '#1a2336' }, '--dsw-alias-bg-layer-3': { l: '#e9dcba', d: '#222d47' },
  '--dsw-alias-bg-overlay': { l: '#fcf5e2', d: '#28324e' }, '--dsw-alias-bg-module-platform': { l: '#e4d6b2', d: '#1d2740' }, '--dsw-alias-bg-multi-select': { l: '#eadfc0', d: '#222c47' }, '--dsw-alias-bg-skeleton': { l: 'rgba(120,90,20,.08)', d: 'rgba(255,255,255,.07)' },
  '--dsw-alias-bg-mask-1': { l: 'rgba(0,0,0,.22)', d: 'rgba(0,0,0,.5)' }, '--dsw-alias-bg-mask-2': { l: 'rgba(0,0,0,.10)', d: 'rgba(0,0,0,.2)' }, '--dsw-alias-bg-mask-3': { l: 'rgba(0,0,0,.45)', d: 'rgba(0,0,0,.48)' }, '--dsw-alias-bg-mask-photo': { l: 'rgba(0,0,0,.85)', d: 'rgba(0,0,0,.88)' }, '--dsw-alias-bg-mask-drop': { l: 'rgba(255,255,255,.72)', d: 'rgba(30,30,40,.7)' },
  '--dsw-alias-border-inverted': { l: 'rgba(255,255,255,0)', d: 'rgba(255,225,150,.09)' }, '--dsw-alias-border-inverted2': { l: 'rgba(255,255,255,0)', d: 'rgba(255,225,150,.05)' }, '--dsw-alias-border-l1': { l: 'rgba(140,105,35,.14)', d: 'rgba(218,184,90,.13)' }, '--dsw-alias-border-l2-darkmode-thin': { l: 'rgba(120,90,30,.18)', d: 'rgba(255,255,255,.08)' }, '--dsw-alias-border-l2': { l: 'rgba(130,95,30,.28)', d: 'rgba(214,178,80,.24)' }, '--dsw-alias-border-l3': { l: 'rgba(130,95,30,.38)', d: 'rgba(214,178,80,.32)' }, '--dsw-alias-border-l4': { l: 'rgba(130,95,30,.5)', d: 'rgba(214,178,80,.42)' },
  '--dsw-alias-brand-primary-invert': { l: '#231a05', d: '#0c0f1a' }, '--dsw-alias-brand-primary-new-colorprimary-new-color': { l: '#b9850a', d: '#e3b93c' }, '--dsw-alias-brand-primary': { l: '#bd8a08', d: '#e3b93c' }, '--dsw-alias-brand-text': { l: '#2c2005', d: '#241a04' },
  '--dsw-alias-button-contrast-fill': { l: '#5c4a20', d: '#ead9ac' }, '--dsw-alias-button-elevated-fill': { l: '#fffaf0', d: '#1a2336' }, '--dsw-alias-button-floating-fill': { l: '#fffaf0', d: '#1d2740' }, '--dsw-alias-button-floating-hover': { l: '#f6edd6', d: '#202a46' }, '--dsw-alias-button-ghost-active-border': { l: '#b79b52', d: '#a98a3c' }, '--dsw-alias-button-ghost-active-fill': { l: '#efe2bd', d: '#1f2943' }, '--dsw-alias-button-ghost-active-hover': { l: '#e6d7ac', d: '#26334f' }, '--dsw-alias-button-info-fill': { l: '#9a7a10', d: '#d3a92f' }, '--dsw-alias-button-info-hover': { l: '#b18f16', d: '#e6bf45' }, '--dsw-alias-button-primary-dimmed': { l: '#eedfae', d: 'rgba(227,185,60,.16)' }, '--dsw-alias-button-primary-fill': { l: '#bd8a08', d: '#e3b93c' }, '--dsw-alias-button-primary-hover': { l: '#a57605', d: '#ffd968' }, '--dsw-alias-button-tool-bar-fill': { l: 'rgba(140,105,30,.14)', d: 'rgba(200,200,210,.12)' }, '--dsw-alias-button-tool-bar-fill-invisible': { l: 'rgba(140,105,30,0)', d: 'rgba(200,200,210,0)' }, '--dsw-alias-button-tool-bar-hover': { l: 'rgba(150,110,30,.22)', d: 'rgba(215,215,225,.18)' },
  '--dsw-alias-interactive-bg-active': { l: 'rgba(150,110,25,.12)', d: 'rgba(255,255,255,.12)' }, '--dsw-alias-interactive-bg-hover-accent': { l: 'rgba(170,125,30,.16)', d: 'rgba(255,210,110,.16)' }, '--dsw-alias-interactive-bg-hover-danger': { l: 'rgba(200,60,40,.06)', d: 'rgba(240,90,80,.16)' }, '--dsw-alias-interactive-bg-hover-solid': { l: '#f1e6c6', d: '#26334f' }, '--dsw-alias-interactive-bg-hover': { l: 'rgba(150,110,25,.08)', d: 'rgba(255,255,255,.08)' },
  '--dsw-alias-label-caption': { l: '#8a7440', d: '#b3a578' }, '--dsw-alias-label-dimmed': { l: '#b0a37c', d: '#857a5c' }, '--dsw-alias-label-primary-bluish': { l: '#4a3a16', d: '#f8efd4' }, '--dsw-alias-label-primary-dimmed': { l: '#6b5730', d: '#d9cba4' }, '--dsw-alias-label-primary-foreground': { l: '#fff6da', d: '#f6ecd0' }, '--dsw-alias-label-primary-inverted': { l: '#2e2307', d: '#f6ecd0' }, '--dsw-alias-label-primary': { l: '#423313', d: '#f6ecd0' }, '--dsw-alias-label-secondary': { l: '#71603a', d: '#c2b48e' }, '--dsw-alias-label-tertiary': { l: '#8a784c', d: '#9d906a' },
  '--dsw-alias-markdown-citation': { l: '#ede2bd', d: '#182136' }, '--dsw-alias-markdown-code-block-banner': { l: '#e4d6b0', d: '#141c2f' }, '--dsw-alias-markdown-code-block': { l: '#e9ddb8', d: '#0d1424' }, '--dsw-alias-markdown-code-segment-selected': { l: '#f6efd8', d: '#2a3654' }, '--dsw-alias-markdown-code-segment-unselected': { l: '#e2d4ab', d: '#141c2e' }, '--dsw-alias-markdown-inline-code': { l: '#e6d8ae', d: '#18203a' }, '--dsw-alias-markdown-placeholder': { l: '#e3d6b0', d: '#131b2f' }, '--dsw-alias-markdown-tag': { l: '#ecdfb8', d: '#1c2742' },
  '--dsw-alias-scrollbar-bg-l1': { l: '#dccda0', d: '#1c2640' }, '--dsw-alias-scrollbar-bg-l2': { l: '#dccda0', d: '#1c2640' }, '--dsw-alias-scrollbar-hover-l1': { l: '#c3ac70', d: '#705f24' }, '--dsw-alias-scrollbar-hover-l2': { l: '#c3ac70', d: '#8a7430' },
  '--dsw-alias-state-business-primary': { l: '#a37f0c', d: '#d9b33a' }, '--dsw-alias-state-business-tertiary': { l: 'rgba(150,115,20,.14)', d: 'rgba(210,180,70,.15)' }, '--dsw-alias-state-error-primary': { l: '#c2402e', d: '#e25448' }, '--dsw-alias-state-error-secondary': { l: '#da6f55', d: '#d96a55' }, '--dsw-alias-state-success-primary': { l: '#4e9638', d: '#7fc95c' }, '--dsw-alias-state-success-secondary': { l: '#67ad4c', d: '#67bd5a' }, '--dsw-alias-state-success-tertiary': { l: 'rgba(80,150,55,.14)', d: 'rgba(120,200,90,.15)' }, '--dsw-alias-state-warn-label': { l: '#94690a', d: '#ffd27a' }, '--dsw-alias-state-warn-primary': { l: '#d6980c', d: '#e0ab35' }, '--dsw-alias-state-warn-secondary': { l: '#e0a92a', d: '#eec047' }, '--dsw-alias-state-warn-tertiary': { l: 'rgba(220,165,25,.16)', d: 'rgba(225,175,45,.16)' },
  '--dsw-alias-toast-bg': { l: '#232c46', d: '#182036' }, '--dsw-alias-tooltip-bg': { l: '#1b2238', d: '#121829' },
  '--dsw-specific-bubble-highlight': { l: 'rgba(190,150,45,.35)', d: 'rgba(225,190,80,.30)' }, '--dsw-specific-bubble': { l: '#efe3bd', d: '#141d33' }, '--dsw-specific-input-major': { l: '#fff9e8', d: '#131b2e' }, '--dsw-specific-login-input': { l: '#f6edd4', d: '#101828' }, '--dsw-specific-menu': { l: '#f1e6c8', d: '#1a2336' }, '--dsw-specific-selector': { l: '#ecdfc0', d: '#1e2942' }, '--dsw-specific-sidebar-fill': { l: '#e7dab5', d: '#101623' }, '--dsw-specific-sidebar-nav-item-active-accent': { l: 'rgba(190,150,45,.25)', d: 'rgba(225,190,80,.22)' }, '--dsw-specific-sidebar-nav-item-active': { l: '#efe2bb', d: '#1c2740' }, '--dsw-specific-sidebar-nav-item-hover': { l: '#f0e4c4', d: '#182138' }, '--dsw-specific-tip': { l: '#f2e8ca', d: '#182138' },
}
let lr = ''
let dr = ''
for (const k in T) { lr += k + ':' + T[k].l + ';'; dr += k + ':' + T[k].d + ';' }
// translucent surfaces so the wallpaper glows through (dark)
const DG = [['#0a0f19', 'rgba(7,10,17,.78)'], ['#131a2a', 'rgba(19,26,42,.85)'], ['#1a2336', 'rgba(26,35,54,.89)'], ['#222d47', 'rgba(34,45,71,.93)'], ['#28324e', 'rgba(40,50,78,.94)'], ['#101623', 'rgba(16,22,35,.86)'], ['#1d2740', 'rgba(29,39,64,.89)'], ['#182138', 'rgba(24,33,56,.89)'], ['#1c2740', 'rgba(28,39,64,.89)'], ['#0d1424', 'rgba(13,20,36,.91)'], ['#131b2e', 'rgba(19,27,46,.91)'], ['#101828', 'rgba(16,24,40,.91)'], ['#182036', 'rgba(24,32,54,.93)'], ['#121829', 'rgba(18,24,41,.93)'], ['#1c2640', 'rgba(28,38,64,.9)'], ['#141d33', 'rgba(20,29,51,.88)']]
for (const d of DG) dr = dr.split(d[0]).join(d[1])
// translucent surfaces (light) — the wallpaper is visible in BOTH themes
const LG = [['#f2e8cc', 'rgba(240,232,206,.78)'], ['#f9f1dc', 'rgba(248,241,220,.86)'], ['#f1e6c8', 'rgba(241,230,198,.89)'], ['#e9dcba', 'rgba(233,220,186,.92)'], ['#fcf5e2', 'rgba(252,245,228,.94)'], ['#e4d6b2', 'rgba(228,214,178,.9)'], ['#eadfc0', 'rgba(234,223,192,.9)'], ['#e7dab5', 'rgba(231,218,181,.84)'], ['#efe3bd', 'rgba(239,227,189,.88)'], ['#fffaf0', 'rgba(255,250,240,.9)'], ['#f6edd6', 'rgba(246,237,212,.9)'], ['#fff9e8', 'rgba(255,249,232,.9)'], ['#ecdfc0', 'rgba(236,223,192,.9)'], ['#f2e8ca', 'rgba(242,232,202,.9)'], ['#e9ddb8', 'rgba(233,221,184,.92)'], ['#e4d6b0', 'rgba(228,214,176,.92)'], ['#e6d8ae', 'rgba(230,216,174,.92)'], ['#e3d6b0', 'rgba(227,214,176,.92)'], ['#ecdfb8', 'rgba(236,223,184,.92)'], ['#e2d4ab', 'rgba(226,212,171,.92)'], ['#f6efd8', 'rgba(246,239,216,.94)'], ['#ede2bd', 'rgba(237,226,189,.92)']]
for (const l of LG) lr = lr.split(l[0]).join(l[1])

/* ------------------------------------------------------------------ */
/* Original sprites (terraria.wiki.gg), embedded for offline use       */
/* ------------------------------------------------------------------ */
const P = 'data:image/png;base64,'
const S = [
  P + 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAWBAMAAABTd4N3AAAABGdBTUEAALGPC/xhBQAAABJQTFRFAAAAV8tsOrtSL5hCJHQzEjoZjXUSpwAAAAF0Uk5TAEDm2GYAAABRSURBVHjahchRDcAwDAPRUCgFUzAFUzB/KpOyKZs0V72/e9W5qy6BLQKAvQGLBLAW6ADzWC0RSOIWIIHV8ERvgCcYYgbxTQHKGpJcAcqf6g8XVf4+sXtu1SMAAAAASUVORK5CYII=',
  P + 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAWBAMAAABTd4N3AAAAElBMVEUAAAAaSawgWtQKHEIUOIRAdOICk79SAAAAAXRSTlMAQObYZgAAAFBJREFUeF6Fy+EJwDAQgtFbwRVuBVfICtl/lcYDoWBKv38+sCZO5QLIhT6ZAs7U3rvBBG+BJQGCke4EPQQO/AD8ggl3kLh1AYlpaScUX1XCA8GOLF3RH5VBAAAAAElFTkSuQmCC',
  P + 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAWBAMAAABTd4N3AAAAElBMVEUAAACvV8ucOrt+L5hhJHQwEjpSOKx0AAAAAXRSTlMAQObYZgAAAFFJREFUeNqFyFENwDAMA9FQKAVTMAVTMH8qk7IpmzRXvb971bmrLoEtAoC9AYsEsBboAPNYLRFI4hYggdXwRG+AJxhiBvFNAcoaklwByp/qDxdV/j6xe27VIwAAAABJRU5ErkJggg==',
  P + 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAWBAMAAABTd4N3AAAAElBMVEUAAADLy1e7uzqYmC90dCQ6OhK9L8hAAAAAAXRSTlMAQObYZgAAAFFJREFUeNqFyFENwDAMA9FQKAVTMAVTMH8qk7IpmzRXvb971bmrLoEtAoC9AYsEsBboAPNYLRFI4hYggdXwRG+AJxhiBvFNAcoaklwByp/qDxdV/j6xe27VIwAAAABJRU5ErkJggg==',
  P + 'iVBORw0KGgoAAAANSUhEUgAAABMAAAANCAYAAABLjFUnAAABgklEQVR42oWSzUpCQRiGu4YW3UtERIsIigiXFa0iooiIEpP+E4kwCbJf7EeMiqIoaFUmJK68AUFp4crvJmYONA/DiAwHEx4PZ2a+Z97vzHSF/dTAWo+hqvpjv4Z6G7xXmfdKQiUR1RetmGdJT6Saeu5EdDwnevPOsp6HphqMl1TvasWII6EiI5lUQxtlIxE9mxG9dCk68ShB6lWC9JsEmQ8Jrr8kyH6Kjt4IG6nRnTJ1fqIRNbxV1FOHoleubILdB0SWgxcryxclyH0LQsb1wjnCokk40p6qQCJEtAWkacng6F1IhgwpcjYhoWm54FJ1G35oDQkt8ETgwwYIATkQgHo8yOqaVHyj2K0v+5/kk9Aup+3LHAhpw2s3JOn+s+j5M0+2nEWAyCXkIIBTpdCHcTu/eGFl/OnpNPZQITDG6ertewfviOz8zHErWUpFkrV2oZOCk/ufoLWO0xzbq+FxV+PUCBsIaZn7RvROsJZ1ajzRoN6/uCmDGOpA7I7YdUKdc/wB4cZmRMzle/0AAAAASUVORK5CYII=',
  P + 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAWCAMAAACWh252AAAAS1BMVEUAAAAIPIsgjagttte42/BhyOFHscrg7PCY1OrA4+xvyuA6qsQwqsg9qsYop8aE0OctW6g4o71pod9Avduz3+qS2eqt3er///80c5MC3Ma9AAAAAXRSTlMAQObYZgAAAKBJREFUeNqN0OsOgyAMhmFO7VQ8o3T3f6Xjs1ncn8W+icHQJ4Hg7t4/uTsT0GEIMRLVKlKrIjvQYUqvq7MlchwgNoCxCAAIEdbzJAKxghhL6Tq66nsQEVzXBvSAfWcGAQDRhqEREyhFAfOy4AB8duA9HmnbuDWOOU9TzkTMKcXWutpAIy1szXPOWFMCCcH7Z+AuoigEDL//OjYAkD85ZwAfF9IU/fBj9pcAAAAASUVORK5CYII=',
  P + 'iVBORw0KGgoAAAANSUhEUgAAACQAAAAcCAMAAAA+9+1qAAAATlBMVEUAAAAPH2AeN5ghRa0lUq0vWaYXQG8pYKwxX6VKe8swXKYvVqFDcsVKess0XqQ0X6U0XqUXQW8zXKEXQG5JeMcWPmsADkEyW5yAmPIADTzNKhexAAAAGnRSTlMAra2trev7rev76+vr+/v7+/v7+/v7+/Ly8s2OYmYAAACrSURBVHjancpZDsMgDEXRzBQyMdmE/W+0uFFlVOXD9H496Z2uLud6ca0o5+vKmVcryqVnxL8U8eV9jFiK0XvmcpQSDUSAEKx1pfN0DgCRSEpS1H1YjCEsyzxP07YZo9TrpfWyANxEjgCO4yZ3ShFzzloAOaIQ932ex5EAs2nSGrHr5Kjv15XIF3HGjGPft6BhIPLE/kFcTdpRzeqGQYyYlX4BEyEi9hgRMXoDLg4eCei5mOUAAAAASUVORK5CYII=',
  P + 'iVBORw0KGgoAAAANSUhEUgAAACwAAAAeBAMAAAClGOGUAAAAJFBMVEUAAACoo9FzbMB0bLd1cJ5pYrZqYq1rZpRhWaQ9NootKF0VEyfEUP+uAAAAAXRSTlMAQObYZgAAAIhJREFUeNqFz1ENBCEMhGEs1AIW1sJaWAtYwEItjAUs1NyVMuGSu3T5n5rvYZKWnXlllzJtADCzMy/TpqowO/BCT0QUsIT/VfrcSZmKi3p3CU95b9zTRVQzDiVffbrET2/8QMM19MBPXc4aUuaIpwx45QHWiBgpL69glZqy+3cIflvKM/uplIw/zRUjDlXShX4AAAAASUVORK5CYII=',
  P + 'iVBORw0KGgoAAAANSUhEUgAAACwAAAAeBAMAAAClGOGUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAhUExURQAAAOOumc+MdtiDVrpjUsRcOK5PP6pEKZ1BNYQtJ08bGEMj7+oAAAABdFJOUwBA5thmAAAAhUlEQVR42n3JQRHEMAxD0VIoBVMoBVMwBVMoBVMwBaNcR9nk0Jno3/R0rbKrWoswUNE8ONdEEcHBuZrcXeW+cRCGSiscRxEeunnUzth1BOcM3alKp6pFODz2gSg/sXocERZ1i5xZ+BPJWEUt/70ZrYTbey7Nd+qB4W4xMos2bT0x/NN15B92Bdq/rz8idgAAAABJRU5ErkJggg==',
  P + 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAWBAMAAABTd4N3AAAAFVBMVEUAAAD9swP9eQP9WwP9IAPHEQNTBQHQXHM6AAAAAXRSTlMAQObYZgAAAFRJREFUeNqFyFsNgFAQA9G1cC3UAhbGwlqofwkkS3gklDBf7anJ08wIdiNJ9ge4QdJaG44wf2AJRwB0iJTADegMZ4A/uIgMzV0HKPdF3a4A5Uf1hh0VFku1CoO9PwAAAABJRU5ErkJggg==',
  P + 'iVBORw0KGgoAAAANSUhEUgAAAEYAAAAuCAAAAACw4jBvAAAAAnRSTlMAAHaTzTgAAAC+SURBVHjavdPBCcMwDEBRD9o5TCbJFKZblKzTEepa0F9HWCCQ/E9Chwc6qKx7qIpRDgNwqsB2MQCksTzGJp63oHIYkOOYACOhMhgQi3j9JRugaMZGAN6j79R6QFGMRlqzEOnqAaUyU9cvEKBAxkRgaEY4ay9DIBkMCIwNURvJk+YztECSGSDdTIDsZ3T5DDmQRIYcSDBTe6zIJqjWOKYM6FxmASCxDJCdRkIZoJ6XAIlhgLyUECBBDJQzIUKZD1OFaIeylyvZAAAAAElFTkSuQmCC',
]
const CU = P + 'iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAATElEQVR42mNAB6FyDP+RMbo8uRoQCh+V+YDxh+0LwBgmTq4GTIXTnMXAeHuEJAhjaCRbA1xBlbkQCMM0wgyiQAMUoGvEqZBkDbSPaQDtjroN14xcPgAAAABJRU5ErkJggg=='
const SI = P + 'iVBORw0KGgoAAAANSUhEUgAAAAwAAAAOCAYAAAAbvf3sAAAAUklEQVR42mNAB0pm9v+RMbo8uRoQCheuWQvGbz9+BmOYOPkaYAL9c+aCcWx6Ngjj1Ei5BjffABBG10i5BpgCiAYEhhlEgQYoQNeIUyHJGmiflgCJowD0XY0MQQAAAABJRU5ErkJggg=='
const GO = P + 'iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAYAAAAiYZ4HAAAAYElEQVR42mNABzHOHP+RMbo8uRoQCs9s9QDj/z+3gzFMnHwNProc/4EYrnBKnQQI49RINQ1whe9uVYEw5RrgCqtiuEAYphBuEEQd9TQgMOUaoABdI06FZGrA1IihkGwNAEX1OViHhGMZAAAAAElFTkSuQmCC'
const GEL = P + 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAOCAYAAAAmL5yKAAAAVUlEQVR42mNAB6pWLf/xYXT1lBqAqVEveD8KNkl6jIJh6mhtAEKjVdF/ZIxhEOUGwBj6IfuBGKoRE+M3AGEz5QbgcglBv0M1km4AfoMwMfUNGPi8AACcMm5ARZ+V/wAAAABJRU5ErkJggg=='

const SPECIES = [
  { i: 0, n: '绿史莱姆 Green Slime', min: 2, max: 4, gel: 0.9 },
  { i: 1, n: '蓝史莱姆 Blue Slime', min: 5, max: 10, gel: 0.9 },
  { i: 5, n: '冰雪史莱姆 Ice Slime', min: 8, max: 15, gel: 0.9 },
  { i: 6, n: '尖刺史莱姆 Spiked Slime', min: 12, max: 25, gel: 0.8 },
  { i: 2, n: '紫史莱姆 Purple Slime', min: 60, max: 110, gel: 0.8 },
  { i: 7, n: '腐化史莱姆 Corrupt Slime', min: 70, max: 140, gel: 0.7 },
  { i: 8, n: '猩红史莱姆 Crimslime', min: 90, max: 160, gel: 0.7 },
  { i: 9, n: '熔岩史莱姆 Lava Slime', min: 150, max: 300, gel: 0.6 },
  { i: 3, n: '黄金史莱姆 Yellow Slime', min: 250, max: 600, gel: 0.6, g: 0.12 },
  { i: 4, n: '粉红史莱姆 Pinky', min: 600, max: 1500, gel: 0.6, g: 0.2 },
  { i: 10, n: '彩虹史莱姆 Rainbow Slime', min: 1000, max: 3000, gel: 0.5, g: 0.35 },
]
// Shimmer Ocean — Terraria 1.4.5 official showcase picture (embedded, offline).
const WALL = '/9j/2wBDAA8LDA0MCg8NDA0REA8SFyYZFxUVFy8iJBwmODE7OjcxNjU9RVhLPUFUQjU2TWlOVFteY2RjPEpsdGxgc1hhY1//2wBDARARERcUFy0ZGS1fPzY/X19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1//wAARCAGQAoADASIAAhEBAxEB/8QAGwABAAMBAQEBAAAAAAAAAAAAAAECAwQFBgf/xABGEAACAgEDAgMEBQkGBQQCAwAAAQIRAxIhMQRBE1FhBSJxkRQygaHRFSNCUnOxweHwBjNTZJOyNGJykvFDY4OzJIJEVdL/xAAaAQEBAQEBAQEAAAAAAAAAAAAAAQIDBAUG/8QALBEBAQACAgIBAwIFBQEAAAAAAAECEQMSITEEEzJBIlEFFDNSYSNxgbHwFf/aAAwDAQACEQMRAD8A8g6Y+zvaE4qUOg6lpq09K3+8t7Kipe1+iUknHxLp+kW196PtOlWWPieK27m2rd7HD5/8Qy+Nn0xk9flrj4+03Xxf5L9p/wD9d1P/AGr8TmnCeOcseWEsc47OMlTR+hSzzb04qtSSfq/L5HzP9s1FdZ084pKUsLTa5dSVfvZr4vzuTkzxx5JJtMsJHkdHmwYeoU88NaXG/D+Hc9hdX0HUZY41PVJu42nyeJHpMU8EckV9WPv0ruV+vGxklDBWWNao+9GVeR77Mc7dXzE63Gbr0+r6XTjlT+o243+ku55lx/WXzOqWX6d1mVrHPI5KXhqKtprjY583R58TbzdNLHW71Qo3hdeLWetvpBGqPmvmYreoO9Op/uOv6N0uWefJCccWGEU4qcbbdfVX22bZ0v0vVPp1k0xjPXSae62fc6I+1JKGnJjhNtwcrf1tPmeUlplFxSTunXwLQjifTtyX52003va/q/uJYr05+1NcckXixyclUZSdyjtTd929jV+2Ja9csSdST3lxvf8AE8j6PLw/E8NOG1yS4fk/JlcWieSCzP3K3fz3/cZnWzcWyz29OHtWcMkZUvdUlWru29/jucW85+6rcnso7kQ6fFOc4Y5qTTqFwrX+BbD1M+jjmhCNOUafbS7r+Jdzzr2a/dv9EnX5yePHLsm9/t8jo+jwxQUU4zmt+efU4E8U1COmKm5O5Pfbav4mTmoXKEUmt00TVt0mo7cyd1KoLsvMwk0nvJfMl58PUZs0+ogktLUUr2dL+ZXN00ceJT917pVp+P4EmUlkq9d+j4EakuZL5mDezitlqW32GmaOB5I+BjqLitmrd1ub0zpdNN7NMh0u6T9WYtaGqWmWpJ7UXxxwvDkllf5z9H1GjS1q+V8wYJQk3UYuvQ1xfUrybRo0uQSAgQSAIBIAgBU+CutatNPmrAsCQBABIEAAAAAAACBaEFLmcYr1ZUEHRoxR5afxZSUYdlSKw2e70/FFpNqzKqaSrTLq3yPiiooCzW2yKlAAFEAkAQCQBAJAEAkAQCQEbY+mnkwyyx1NRi5VGN7eb324KYcfjy0xk0+WnHf0pXvuVh1Wbp9oyelrTXmrv57/AGmcMs1J5ItqXmv0d7/gfPyz5e1j6GPHwfTmVvlrlxvFnlhya4yTq5Qpelu9i+fpp4McJyU2pNxuMLV+m+5jl6nJ1M08m752f1n+BafW5njeKcrVt7v6t/w/8Gfq8ut7dfo/G79dtcXSyzY3PG3JJNpRjbpc2r2M8MVmdKTi+alGnXp5lcXU5emSeOTSaaq61W7+xlFklKbyLUpeadOO6fz2Rfqcu9bc/p/H6dtunKn02Z4cinFxq3KFL7dzTPjnhxLJKMnFy0vTC1fld7nJn6rJ1Ul4rtvZtP639fcWl1uZY5YpO4tuVX9V/h+4z35Nb26fS+N367/DoxYH1MbhcqtqKjb25tXsY4/z70puD5eqNbd68ymHqMvTVPHJq771qvm/LjYosspzlNXqprZ00n/Evfl2x9P4/S5bbdRifT5njy+JGldvHwvXcvl6aeLB4r1OOrS3GNpPyu9zDP1WTqaWWTltTkv0v6+4s+szRxyxN3GTvTfD9PT9w+py63tr6Pxu8x216fppdR/dtvlUo3K1zavbt37mEVqtJyUkm6lGrS5oYeoy9PU8Umt27/WtJP7NkTLx5z1yx5IuSbScXxW7/eX6nLLq1zvF8fpbL5QC2JY5S/ON6avZ19/ws6Ov8DHDF4U45G47pJxSfatvLzPdu3ep6eGYr+y3Xtfo3/7j/wBrPrsub34Youack23BW15HxUZzx5YZYSrJjeqLPZxe3upaX/4UJPhyWRpfuPifxH4nLyc+PLhj2mnr4s8Zjq19F0sPDjqkqk1x5eh85/bB31PTfspf7kbP+0HURaS6GDvyyv8A/wAnk+0Oqzdd1Ly5tKcVpjCN1Ff1ycfg/E+TPkzl5Zo5M8LjqOOOaccbgn7rdmWWTlja4ik1Ff13NPCx/qIlY4Kmoqz9FMcZdyOFytmqzxTljlJwdStq+6Jk5Sdybk15uy7hGTtxTZHhY/1Uamp50m7rTFc321P9yOnBLBoyR6iE22vclH9GX4FdKrTSryI8LH+qhtGTVygu9/wJxuoxa3aRqoRj9WKRDxwbtxVi+RGuehY3J6E9Vdr8zKK49Y7fNm3hw/URLjGW0kmP9hS2mnG1XBnNfWrtH+KNvCx/qolRjFUkkBbFLDGDlKGqaaa533t01xtt9pHVS6d4dOHHKMk3cnw00uF8SvhY/wBRBY4J2oqzPXzsRgcI55eNDVG3afw5OvL1HT5MeOLhJ04Nr0S33+ZyyhGX1opjwsf6iM3CZWWrtlKtU3FVHXtfZbnZj6jBCKXgyrQrUZU3JPlv4GOlVVKvIr4UP1EauMymqkul+plgksS6fG4++7tdtVr7jlcZNJR7N2joUIxdqKQcISduKbEmpoZRjpikuxfF9RvzbJ8OH6iLcGrQLwxzntCLZVc3VnSusaio+HGl2Tozd/hHM4uLakmmuzIOjJ1LnGtEV95gWCASQAKuK1qVK65LAABv5AIAAAACgACAACgXx5JY3apryZQEG/jxf1otfAqpwb4aMgTrBpJ0ZuT7AF0iOeRRIAgEkFUABEAAUAAQARKSit2SABJBR19KunnhnjnPROUG17qdu2u/kq29Tilllhx5XFRyzhG4ycV7rtLjvt5+RE4Nr3du4jBpK201xXY8GXBncq905+OcUx6+Wcp5sWfC3lw545atRit757djn6zr80OpnjioxhCTUEoLZfGt9jpx4FCcmlp1c0/uXkiMmBTlFuKlp4v9z80Y+jnrekvNx3LxFOo63Nj6TDOGOEZZE9ctC3p0uVttvsR0fWZZYs0nihN443C4/Vdry52t0/I3yY9cJRfvavrX3/AjFi8OCirio7qnw/P4l+hnvTP1cNenFi9odRLPG1Gbk91oXvfJGvXddmx9TPFCMY44SagtKe3Z21bNoYVDJKaSi5ctfw8hlwRyOLcVJR43qvT4E+hnrel+rhtTL1uaHQ4skccIzm2pT0LdLjlUv5EdD1mWay6sUcihBygtPDXHHPwN549UGnvapp8P8PQjFiWOCivdSdqnvfnfmX+Xz3pPq4a9OGPtHqXmW0ZSb3Whb+myN+v67Li6mWLHGMMcX7q0p/bbVs1jgUczyJJSfMl/BdhlwRyKKcdSjwrqv5E+hnrel+rhtSXW5oez4ZY44rJKTi56E9lVbVXnv6GvsvrOo6qeTpsk2sDxyk6X1aV/vRfZwcJ41TSTklz/AC9CYPHh6X6PhxuKlNOUnzNevluY+ll6sPqYaq+CLyS0t6VKO778rjZ/1Zv13RQ6dQlmjOGpOTkn79p/pc/H0MMcHOTjCLcnF15Lt/Et1PT5H4f52NveKf1dnVR7/ie63HeW7XDHeppPHqdUOscYxj4UaXk6OGUZ6o06XxNO2+51slZdy6nBJNtTUmqo5ZynJrRBxSe2wx4pTeyOuPQ5GvqsxuYrpwSc225Kn8KIOvN0k4cpnLKLT3NTKU0g16bFHNnhjk3FPy7mRbGnLJGMWk29m3wW+h0vockMkWorLC962+fkZdRHHDLKOOnFPZpns9RLFGCjlmlKW2y3Zy9X0alBSwwVVycZnfytjyiHRMlKLqt/iQdmSgSCqigSAKpp7okrH3XpSdc2XjFykoxVt8IhUAtokp6Je7K637FsmOWOVSrbmmNozABQAAAgkAQKJAEAvDHKe9VFcsmUa4XzGxmQ2/ImVx5QTTCK274LEgCKFEgKigSAiCCSQKgsQUQBK9LrkLjciAJAVAJBUQQ09qdFgQQCQBAAKAAQAAEAAFFZR1L8CaokEFZSUSVurDSaJoDaOHEsMMmbJkTyXohjhqdJ1bseH0/+c/0o/iaLjpP2M/8AeaUPjfG+vh3ud91rKzG6059HT/5z/Sj+JOjp/wDOf6UfxNqFHo/+fP76z3/wx0dP/nP9KP4jR0/+c/0o/ib0RQ/kJ/fTv/hg8fTNU/pn+lH8R4fT+fWf6UfxOihQ/kJ/fV+p/hho6f8Azn+lH8SNHT/5z/Sj+JvQofyE/vqd/wDDDR0/+c/0Y/iHDBtX0v1/NR/E3oUP5Cf307/4c7jgi9SXVbcXhi/ustGGKeKWhNTyJxVxWm+U7u4v0RvRzZ04Zcco0lKVS+xOjxfK+DeLC8mGVunTDklurGUG+Y86bSq74rb40/sNevy9X1EYLLBzjFVpSV16qtvs+Bnhk4e+ldR+XHHx4+006/q4Tji8PG8OlOOvU3dvd29pblx7/q1Z/wCiTXhbT6F4Y3J1RZTj+ovvOrBmxqSvHEtqvR9l9DKbVR+2j3sPsfDCSm55L8lLYz9k9VhcNKSiz17VHzs8rcrutPI672bBwbhFv4I+Z6vo3C9EPee1to+6y5IY4OUnSPlPa3VYZ5JVBM3w5WXUSx8z7ylTi7+BNHVPJBv6i+bMnKP6iPfKjJpt29xbqrdeVl21+qitryRRQFrXkLXkBUE7ACASCiC0JOE4yjynaIHD2IPWyY/ExxnoUns1FrhnndXCcZ3klcu5Euty5vdc3S9KTomfUZMkdM1F+uncxjLEvlzN/MtW9k0DaSABaE3jlqSi3/zKwpjxTyOoRvzfZG66eEV77bfpsi8Oue3iY4P1Rq/AnF5E5aXt6mLlRzTwRhG6cr4d7HPR0Z2orRCL082zmba7lm2amM5Qfutp+hfxZU7Ub86M/XuRuVNrNt8kFVb5L8GmohlXJvzLkAVjqcklFts3WCde97vp3My0JPz29W6JRM8SjxP7jN7Gkua7ehlIRNidklSUym0gAKAABV8bl1jf6Tr4FCdUv1n8wg4tEBtvlsAQCQBDAHYACK9SQAAAh7JsJ2rJFAQCSGwgCCbAsotoaSNT8xb8yeUdUf8A+L+xn/vNTOHPS/sZ/wC82o9X8P8A6P8Azf8AteT7lQWoUe7bmqC1ChsVBahQ2KgtQobFQWoUNipzdXzh/wCv+DOujl6znB+0/gzy/Mv+hl/s3h90YYXBSTyK1p47dm7+xM6OvyYYrH4Eo5JONSjKFK/0du2xz4Y62ouWlONOue3H9cWb9f0uLBHG8kfrJv3JJzTvu1zZ8ySXtvHbrPx5RZKlTKA6q9Po+seJrc93D7acYU5HyCbXBdZZLucM+GZK+h672tLImtR4ObM5y5M5Tb7lE73Ts3hxzD0ibFhHqdD0cHjcs8I6nwpdkayymMHHHos0sam9MU1aUnuzueLH02GGlQcmt3y2zpyYvFacJKuHTujl6yGl3kyRqvdSjbZx7XJKwyOGbiUI5POXc4ckZRyOLp1zRunhbbeqP3mGR3NtXT8zrjNMWqsLgq00909wovu1RvRE3fHJKutxVcEhuRAJAFIwSlJpcliSAAAAAABxujePVTpRmoziuzRgBZKOnJkwZFaco/8ALVnLPm0m16kgkmksU959govzLkFTqjSvUkALoAKpNTk7dPsBZbO1yb/SNSqcV8VsYFoOKknOOpeQsF3LG39Vr4mM/rXR0yhjlG4Lb0MGku/zJGazVsnSu+5ayE7NGhKgSAqASEm2kuWQQDSUFHbuUG02rKSjzf2ERnflurVMZI2rrdbo0jFaJS2uTtryIX14V5KtO+SWvIhvYqbEt+dyxEU+XySVYAAigAKgCJNpbBcENJIJBRFCiQBFlJSa4+JoQ0nV9gR149/ov7Cf+83oxxc9L+xn/vOij0fA/o/83/tOT7laFFqFHt25K0KLUKGxWhRahQ2K0KLUKGxWhRahQ2K0cvW/+h+0/gzso5eu/wDQ/afwZ5vl/wBDL/Zvj+6OXHBz92KV6Hu3SXC3+ZbqumcVjbzKOpXFyXuOnXurt/FGeKeycbUtNx9f/HP2G3XT6zMo+LqyJL6re6Xr2+XB82Wfq/Vr/wB/734d5LNeE0KBPJ1VFGmPDPJvFKly26QjD9Y0vZLsuxi5fsLT6HIsbnCUMqS95R5XzOSKSVHdizPG0otbvdss804XDTDTf1aVGZnfyOElJN7ul6KzofhL3oxSk/tSKtq+xe6Vv0senTuOZ6/KXur+ZtkyQzxeNZ4PJ2dVfpZ5s6WSMafvF44027mkvVE1Pe0R1EFinp523fYwdyVL5mstu9r4FTpGZiolJ0nSJ0pefzLCitSaVBahQVUE0X6bpMk5SlKVRvuS3QytXpvfyJOnJ0cotyg1L07nMJdgXxQjOVSyRh8SgKN8mHDGCcOojJ+VHOSHS5ZIIAteZJUQA1YSruwAJAEAWgAAJAgAmrAhNp2nTHP1iXFrlFbV13Ca2o9mQtV2kzWl5ArPVVW+SxaEHOWlVfq6OrwoJVFJ135M3LTTj0urpmnTyUcqtcql6F5qmZ0m+xN7RORU3ZlaRrOVrc52m3sIys3botFpXsVSpEmmpENrlO0UdNb7Lz4NEqVIpnhDJhnGe0Wt35E/CaeXm6nqOnzSgsqku177HRHrsfg+JNpSutK5PJlWp07XZ0Rf3lmPhq+XbL2hlcvc0xXzPVwy1YotzU5Vu0fPKr9D3ejhgWFSwLaXLfIs1RuSCmSaxwc5cIbRYHJmzzX5zFOMsfHG6fqTHrYafei9fkjPaOn08tbjqBxrq5znGEILU/WzqlNRkou7ZZlGbhZ4qwJIKwAAo7MO8ul/Yz/3nTRz9PFuXTJK/wAxP/ednhz/AFWdvg3/AEv+b/2nJLcmdCjTw5/qseHP9Vns3GOt/ZnQo08Of6rHhz/VGzrf2YznDGrm0kTGSkrV18COpxSUVN49SWz/AJevJj0UJxwqORv3LS9d/wADyZfIyx5ulnhcvp4cfbK6rSORSjFvbVFMvGSnHUuDJYGoRTf1UuO+xfqIY3ljLp3JRjVrTWrz+Q5PldM9SbjOGfFyTxlF3srBbmFPZ/yOTqvpGmbwxtwWqrq1/EZfKmG7XPDPHky643bpbSr1dHH17V4Ypq1k3X2M6sb8THCT23t7HH1sU+oxyhbcppK/RS/E5/K+Rx3is37jpw5TPPWP4cvTvwdU4viO9uqW219t6X2mvX9WsmPDWJYYRTUZxtJ292n3+3kricINSkrSi/P4v47Jm/XZ8MXD6NJvJWmeuKW7e2yexwwmWstT/wBp6N71tSzSOn0TKCvItm2rGmqueSft3MqBOppqhq3MiUrdeY6ml1O9kTpko6mnXnWxpiy5sTWiUpL9VcGfUZ82WVTk6X6K2SM6Zt0rq3WzX7hKSS5+RTUnCt7jx3RSzXVnbfVaW8SsvDbdSVmDq0Ki9i9Ta+pLuSpX2ZWNRRdO+zNLEhgBpBdZssY1GckviULRhKd6Vx3JVS8+VqnN0Uq1qbpebLxik/zilXoRki5q0067IM26Zyklst/Uqp26exEk1VqiuxrTHatVT7myxYNmnrl6ul8jmjGXbY04W7sljc8tpx0e6tFPejF18PQfANUSEiAGvUrpfmilWIcb3tkKDXf5Fge/aujflkpUWIBoHoSlbq69WdMYQcV4bTl3a2JboYaK+s69CeFsqRpKK77PzM3H02JvaK2Z0lNujRrv/Eo9im6AgXRUTsSm1w6+BUXsF2s227bbIIskAAAAAAGeaKlhmpRUlXDdI0M+oxvLhljUtOpVdWSj5qcrb2r4cBvY9vB7NwYmpTvJJefHyOefTJTzLFGOlPe+TGfJ0npZNvLT82e97PxeHguOXXGe62qjPJ7KwyVwlKDr4o36Ppn02Nw8TWm7W1Ub9o6CuSKljlGTpNbvyLmefFLLhlCE1GT8xfRHjyumm0l5+ZVar5q/PkicHDM4ylq0utu7EtW062OXaT293aNIZHjncfcl5np4MnjxjJx3j3r9x5Vp12LRzyx5Fob2f1exPqSM8mHabj2bRJ5+DqtXUS8Saja47HbDJCauElJHTHOZPHnjcLqrgrqJTvsbZ3t6PRf3nT/sJ/8A2HonndF/edP+wn/9h6Jv4f8AS/5r0AAPWBGy5aS82aY5dL4eTxpzWRfVUVszilNy5Zxy5Z6jwfI+dx8U1j5rTqJR1uMJqcV+klVmIBwtt9vgcvLly5XLIAAcwNJ1aTrzQKznWy5MZ5zCbrtwcOfNnMcPZJ2tMftOPK1PJ09XXi1v8GdKfuvzObqGo5Onk1ssu/yZ8vlzufmv1Xx+DHgwuOLnwxUmlOTUXHeuXx6qvM26/BgwwxalCcXF+7jnbTvz7333OZfVcavZxtK/t58ik4Tnu3JPm1T+G10vsPoTrZbd+fTPmOwAHVsAAAAAOOBb82VnLTW3JYIFXCL9H6FgDSixxT4v4kuKfYsAaiqjFcIsRFprYkJ4AAFa4I4m28sq8kdWiMoyqS9OKOAkzZtLG8o1s2uOGzGWlbp0QGk1uajOtFW0u51Q6OOnxJSU/SH4nKKp2m0/NbCy1Xfk6eGT3dFaeNNHn5+nlCX95GS+/wCQ0pO1z8RRJLE1v2iLmlVR+xUQWIKskiASKKqASCCstXagk+5YFTSAABBIoUQQSk5OkrYotBtTVK+1AVSblXch7dzaakn7u/rXBzS53Ynli5L/AAIb3W1lYu5bFlGu5Vl2kABQgkAQCQBAJAEHG3HX1GtLf0s7DjTan1Gndb96PP8AI+2N4e3XG9Eb3dIkrBe5FK+F2orny+Dj16XJX2O+9RhoEccutjLG3iaU1wpLkpD2gnjlrVZFwlwydvOl610x6THHPLNVyfC7I48mKM55nJuNPhK0z0MU9eKE+LVnI1JLqYwfd73ucOf7ZpcN78uHNilhlpyRXo0+TCX1lTdfuNMz0ZWoyU6/SMtUk990znXrl/TNtsaTdWoJ/pM9TBhjihUW5N7t+Z411Tg680et7P8A+HT16k3xX1Trx+3L5Hme/DrXwBGolNM9Dybj0Oi/vOn/AGE//sPQbSVt0jzOnk4z6Zp/+hP/AOw6W2+TPxuTrx6/zXm+V86cOXSTdbvNGLT06qfD4Y6vqI58ilDFHEqrTHg5wdMsrld18nm+Zy8s1lfAADLyAAKABSU+0fmc8+THCbrvwfHz58uuETKSSaTMiSD5nJyXku6/VfG+Nh8fDriHN1cW3i0ptufH2M6TDNJqTSTra3XCbdv7l8zlXovpyqMYtRUlJxjTri/62LCMpTjGU2nJrsqJPr8UuOEleHLzWwJBt3QCQBAJIAhkX76jT4uywAEEgIgEm2DA8uRKSahVt12Jboc6VXS7ndg6JSxxy5p6Yy4iuWXksCTjHFGvXn5m+bMlhxx8PfTtv2OWWdvpGf0PppR0R1Rl+tdv5GawdPi2nGU5erozeZp2bY+q1WskIv1J+pNsM0ccW5Qgo2+LMick9cm29vIzckjU2ztLW/kHH1K3bttonWqpWzUtNlPyITTIV9+PIlG1kq1EMOVLhv4GTyO+Niwt0vQIUr7MkLPISlbSbS9WAQduPFixxjJOMn+s3siuXDjldrS/1kcdAz1qaJR0yq0/VEE1tbexWUlW1mi2RIM9b8i6kmipLKkhtLkkq4RYW7/BqXmWTcWmnTRVQivP5k1XBCb/ACvLJOTuT3KNJu2iQDSKS4ABQABBAJAEAmgUQACIHFWqfU6W0t9kr+J2nFNQ19TqabX2djh8j7Y3h7dcHcIvzSObrc+TFCvDUoPZts619VJ7uuTm6zLkxwrHi1JrdtWl9h2vpie/Txnw63XkUjdc0vMSlFtvu/IKn9XnyY/Lu6+nj1EtKxSmordO9kdig9PUK5JXWyOHpOpzQyKONOV/oeZ3S0t9Q3s74s8/PrTM+5aPs/AnclKT7ps48nTN61jVwg/rd0ezpfc4ZqGrqbq7+0c0kk0zhd1zx9myWX844yx+adM6un6ddPGUVJyt3ujqape8+O5lOaUbjud8cZPLlnllfdSRexaMbVu1ZK0KWna/U2x1dmDnpf2E/wDedRwQ+phzY37+LVCUX6yuvS1warq8ck05OLXKcWeLj58cJcb73Xk+V8Hk5uXtj61HVa4sHFPJB7qe/wAGTDNHT70/uYny7+zV/hGOvGbsBzfSIfr/AHMlZ4V/efczc+Vj+zz3+E5z1lHQDn+kRX6f3Mh9RCvr/cx/NY/sn/yeXfuNpzrZfMq6a9TnWTxb97w4x3m6bddq+0tOcMWPxNblFOnadp/19h4s+a53y+1wfHw+Pj1xaAjHi9+MMnUR8Z/oxeyfld/wMlNZNbeVY8eJe+2t2+Ul95y7R6NtjHqWoTwqd6ckvDe/Zr8aNLUIRyY5PLFxckly65X2WY79VKMpxcIw97d8er9EXeOvKW7YR+ql5bEkRdxvi2395OyW59nH7Zt477bgAr0AJojv3CUpjgKSuiXJdnsZ2z2QCXvwFFvm0Xay7VJElpTb2S7hbq07RVdHR9NPNmi3BvGnbfY9B48scuuX1fV7UeQpSXEml8S0Y5Mi529ZHPLG272ldmTFJztxqL8lsVz4lCpSlUey7mUXPAt5y/6U3RGTNPLvNX5ehjXliquS7Lb1I1qqS3M5TSrzDvZmtISTsq4tbqmX3lLRFNyfCRCjkXu+FO16FTwoouVWuTR4nBbuPzLKC8OU8ilfZLgwlJdlS+JqG9JlNR27lfF34K8/AWrruaTtWqknwSZ+I+Fu/gWTde8qDpLKsCqkm6TLBUomgt3SOpYVGF/Xb79kN6Zvhy6JNWlsQlG97NskHoUrv1M3db8Fl2nZnNNr09DHg6Gu6KtJ8lS479MOQavHGuAoRXb5ip0qkXLtuaK+6oPZcN/AzeR/AjX2tAZKbvk1TtWRZdgACgBNbXwBBBavJkBEABb8AASCiASAIo4rbn1GzknfB2nFO3Lqaar4eh5/kfbGsPbrhvCLu9uTDrcebLh0YGlb963Wx08JFWzvrccrlp40/Z+TFj8ScotLlLyOaWGVylBOUVu2ux7PVP8ANP4onGnHLHj6nZUcMrZySR0xy3jt5eLpeocYZ8Kt3xw00ei276n3XdnWpJ8nHUl9IeyVvZq/vM881jFwu67nJ9zhlK/pLSb35Lzy3stkjHGrxZ2ntvyrLz+ozx3zdOieaT2WyMtSr0Kam+xXtR3cGjn2t/Mvjm4zS5T2Odl8VuaW/IHpY8uTFGUcTrXK5O9mqqmu5jnz5oRlOM5pbKvEe3wLmPVRm+mjkpeHKS0yUra37o83Nx8U85e69Eyq0MmZ5JJ5sySinvNmmrJ/jZf+9nn/AEmUZtqKk1Hldkr5X2HQupjKMnTVb1937y8WPH11ZNpnld+HRqyf42X/AL2R4k/8bN/3s5F1UZcRk653XwLY+ojkaSi6bpO1ydOvF+0Y7ZOrVk/xs3/eyrlm7Zsq/wD3ZhLq8UJNU3St7oiXWJJ1jeqrq+1WOvF+0a3lfy6VlyrbK3ki1Td0/Pt/ApOWTM3UdEE20m29T/CjCPWQW017yde7w+PxRK6yLVqDq6+suTl9Hh32a75a03y9a8UFJ4l4tUpPm/Pjf5mGHqo408eRrJjmtm/4+T3I6nJDJ062pt2r2prz+ZwNSco60lKTajTrfjc8/Jw44eMZt0xy37duXrHOS8OChHHtGpNU+/xKfSM/UTUJZJyivrLU6OSMZ3TcbSvTKXNtItGbjTcXDyaM4zrZueFurLJfL1taUbez8ik8ikqowhNygm1TZO3J9SXceK5X09MEgj2IBIAgEgCLaJ1OuSmSahH6yTfFnP8ASax1JKUq3fYM3KT23yVlxtarrfbzJhHTBI4PpHh2oKMb9Dr6SSni1W7vfextMc9+GoJHwDYpNKr28g233I3G4RScFJpu7ssora5SLCgnWEai7jafnZ0TyZHBOMozl5rlHOCWbS4xTNOU2tbdpb2ZO+EjS45G092uQ8cX2r4FjHSsyLV7mvhR9X9pnig1OSceOX5+RT6dEt7SbRqt1uvsZYDbcx0rSXCRJIC6QdGC9GRxdSRgTGUoO4umKlis+oycXt6oQnOUbbZnllck2k16Ew1t7rb1NOePtoKBNh0Q0zN+JfCNSpKlm1VdbqiSSCKhJLsiQABKi3+IVXvdehq5Qkkt41xZKlZOo8feVbvzZo3HjlGU5KNepHO7/KG/sK/aX02VeN+ZpNVX4i634LLH5seG/wBb7inWinXPBbWR4bfceG/NBf1LcghQp3f3Fg1NoOGWl5ep1e6/jXY7zikq6jNGtSe9pXXoef5H2t4e3XG3CN7OlZWSorhlJxjdadJtR3npyuO3H1N/R57bbb/aMcU8sdD20b73Rr1n/DuvNfbuUxU80dnF6O6qzhn/AFcW8Z+mxtGFc0/sOKVNdS2974TO+SbTS5POh9TPqi3d7pWPkfbFw9qvzJxqPhZ22vnRLWyuviiMX91muLad7pE5/tjHF7q2qKW27KN3ZVN0Du5aDq6XHJS1NUq2OeEdc4xXdnpJJJJCNYwObqo10z+voUrSd6b70dJfrOoyZ/Z2PpJKGjArxyrfvz/XY58stniOs1+XBHBCTU445eHP3dW9X5J/PYlQwxU4tt39Zvel8S2HLJwwY3BRjt729unJr05k/ibZHnfTSwKSlDw3jim3w4tfx+5HPj+3xNpnN1zPp1pclHJGMWoy2aadXbVcbclseHHGVxTtcLt8TsyZ8uTUoTfhuTfvN3JuLTv0950u1FEqSXkdcJvzYzYwXS49VyW3lew+iYv+Zee/K8joBvrP2Vz/AETF/wA1PlXz/VL5ET6fBFbp/C+/mbyemLdWc8sjls5bDrj+zOWWmfUYISwRUZOCje1bs8+LnerVOUqv4eZ6E5WZQhpTUFuzjnxdruLjyajjeuMtWp3JVZfGpycVGO0b2van/wCDdYIeFjnplbffdUWjBY26VWcePj7+/Trnn1WxQcYVLansvQs4sqpOyWmeyTU08tu7t609SS01z3JJAe5AJAEAkBHJ105QhHybPPlOUuT1Orhr6ea7pWvsPJi4vmyOPJPO1Xwd/s7KvDeLutzhlptVua9FkUOpV7KWxExuq9a2SmNJNI07AAboKgEWSnYQBNAKoopSk65LEgCCEt36ltrqyAiASAIBJAAhq1RYigmmElFNKMrNYNyW6ZKik7UUmSa2zMdAAJtoAA2iASCCAAUAAAKyVrdXuYY8svHyqc1KCdJrt3Okku03KgkUCgCaFFRAJKZL0PTyBYERvSrLxi2EVOPJa63alcd77na01ycvWRSy4ZNtR3VrZ2cebzhWsb5X6bfEr5Wz3NjHp+ciu2pc9zY3x3eMZvtz9Z/w7+K/eVw34sbraHZl+sr6NP7Ps3K4V+dWmTa8Pu77nLP+rG59tdB5mO1hztNJeu33np0eYo10jtv3pbJO1yTn8yRMVd/gTitYs1aa3+sQ+C2O/o+f3mvtHPPEY4vdUSbSSTJca7UTGTSoq5NndydHTwahLIlbWy/iaQ1Oatp2rUu6RrijoxRXehjjFatPmNOuprS5DSkmnw1RIKrhwNrFh+rUZVd9jtOGCqOWOrTKMravbny8juW6TqrPPwfmN5/igJIPQ5hDdJvyJEnUW/JAcs8utNXt6GNK9uAQ2HEaDlWKSWzrait2Jq4pebRnK+LVk3Y0lcceFbVu6W2/wKSds0mryRi5S92O9uw4Ro5cE/Q6ct/UoqLaq7Fb3IVtndye2QSDL3oBIAgEgCGk00+GeDkh4WSUPJ0e+eP18dPUy22dMOXJPDBS08LcrFtTUlzdlnuy2tJe7FEcXp9LkeTU5Tbf6rXB0nl9D1Chk0zS9/8AS8j1Cu+HmBBLaStnPi6jU5a9KS4p7hbZG9IFMWVZY2lXpZoFiASAIAJAzUKyuV8ouAAAAAgkBEB7JklZLVFri0Uc0+ouNK0/NGmLNGbUbtvyPLb3bNelyLHni5fVe2/YjhMrvy9QBNTjcXs+Gc2bJox6OZcldrZJuukGXT5Y5ItLlcryNQewAACCQAOP2hP8y4rhSWt9kvU7FXmjz+shPHkyZUk4zjo9PtOfJf0+FniuPHLw868LHGcU6qTpM9rDFrHFS5PFw4m8stE9lcqTqTrjY9zA4ywwcW2q5fJji8JllvytRWb0xb2+00o5eselR/celyyuossy91bNvnc1o8tyladnqx+qvgGcMrfaKIa2LAOipZOmQSqTuglSzj61v81taUrrl8HZKSuu78zk61b4ZKr1VucuSforOM8wwU8mXTsrW3Bu3wY4LeXNq2dr12o3UUhxT9EXKXsw6tf/AI2Td1X8SuGnm22ahvtV7lusdYPjJJrzIwp+NN9lFJK7MZf1Y3PtraTqLa7I8zb6Lj92nq8j1DzVb6XHGqWrfcc33Yk9VR8DEk45oyjs1ykWkicDall0rfT512HP9rnxfcyi7RfFDXkjH13M1wvgdnRw2lPz2R1jMnlfqJuGlJ1fJjDI4/VZbrOY/BnMntsaTL27YZlpp25Gx5yk+Hsd+NuWNOS3oNY3fiuOelS6m1bT7qzuSpJX8zhnJ+L1EUt2+b9FtR1dPLVgxyu9Ubs48eNlts9uuV9NAAdmQzzusUt92tjU5eulCOKKlVuSrbt3BrfiOZEuMm+CiyRcqSklytSLqToOWUuN1Vap7kS3lCNNpvsWkyIb54LZ96bo5ct1hV45vKLTaeadJJKl5EN7Ezblkm3zdc2QXimsIcnnKqmkKSfmURrihr5Xu/E3GHrg8r8pT9PkPylP0+Retev6uL1QeV+UsnkvkT+Ucl/o/Idan1cXo4skcsW43s2nZaLUla4PIxda8UWorl3ui/5RnS4+Q60nLPy9Q872jDVlTT301RVe0cnfT8jHN1Pj6XPmPFbDrWc+SWajDiypfVj8nfxJvHtzXxJ1rltnf3H0EHqxxb5aTPCvH5P5nTj66UMcYRqlsrQmFdMM5HT7Qm4RhXDbs8/xJGmXqPHaeTsqVGV464fzL1rGWUt26ugUp529TWlW67npnjYc6wS1Q5ap9zb8oT9PkTrW8c8ZHpmPU5/CeP1e/wADi/KM/JfIyzZ1nalPlbeRetW8k14dv0xWrjSvfudMJrJHVG69TxdWPfn5m+LrJYoKEUqXFodazjyfu9RtRVyaS4JPKydY8tKVVF2X/KE77fIda19WPSB5v5QnXb5EflCfp8h1q/VxemQeb+UJ+S+RP0+d/o/IdafUxeiDzvyhPyXyI+nz9PkOtPqYsM0XDPOO31nwV91R82WnkjklKcluyLx13+Y61wtj1Olmp9PBrsqZx9etOZPs0VxdU8MNMKrncrl6jxq1rjih1rdzlmjpMjh1CviWx6p4ylCLUldp7HT9On6fIdaY5yR248kcqbg+HTLnl4+p8LVo7u9y/wBOn6fIda19SPRM87rFJJpN7LerONddNvt8iM+bI1BZKSlUlXl6nPkvWN4ZTL0q5xWluKjGvqJ0/mWXUqM68OE48b1scOfIkt4JNq60mMZxtbKrVe6eJu17eBY4KLWOChK+En6nWp441GtF8KqPGx5o0k35rZVt8TbBkk5xc5y52bV7HTDkuPhi6r10cHWyXipN8L5GuPLkm6U4JPzRzZ2/E1ZYq3smnzR68M8cvVcc5dMK+R6fTy1YI122POuHFP5mmLqPCTjDj1OvWueOWq9Eg5o5s84Smoe6ld1yWyTz48et6Gu6S4MXKS627/jem4OH6bO+3yJj1WSctMY3J8JI1pj6kdjinJS8jk6xqWTFBfWT5XKL+J1H/t/MxnjyzzQyfm9t373By5PONkJyY7b9On4ma3e6V1XY6DixrPjnNp4/fdtXx6mjyZ//AG35b8jj8YyVbyY7Oti3jhS/TW/dDAmss7d1FbtUZZvHyKKfh0nbViHjwyTneP3vW/tMWf6kq/Ux6utpNNPitzzaa6SDbf1uGdM553Br82rW25g8OV48eP8ANrS+0ics3ZomeOqqnFrjcnApN5dLdV5X2LLFkUlp0L1bugsWVeJ9T3/+YzzXLLxIcfTGb35c64XwPRwaVijGLVpbnJHp5qKvQ2v+Y3lLM5qX5vbh3/I6XOyySJjcdW2o6pJNSfD2OSVJ7JrudWTxckdMlCudnz/XqZLFNRcXokv0fe+8uWVnpJ0tu6y7no64xWnd1tsr+z4nJHDUk5JV30y3Jy59Gy91LbYty0xMtejD4UuoyvqsE3FyVPS9nxX32a9VLDJQl0sJQdtSTg0mkv3nJ9KdbSflwT9Kd3qfyONx3+XSc2U/Dpw5NPuzU1tdOL937TXxY91JVzcXscC6pr9J/IfSmltJqvQ3jlqaS8lt3p3+LHva9WmvsObr4JvHk1cXte1c2Ux9S3Ne838DTNGWRLw9Ka397jnmv4Ft7Qw5euXlyznHPkUtTlpVJ1X2F07JlCUbnl003s4P+qITjXDN8c8HJn2y2gnBv1Gzaddu4uJbDGL6jtWm9+xz55ei8V/Urxd82yPgTHRXpbJuPqdcJesc8r5qrJ7D3PJk+613LqptyAA7KAAASQCCQQAJBHw7kvZ0wAIJAAKu4Aso2iOGNTIuyTexIIBUSS1SKgaVIIAEgAABYCAAAkmitgCeQCAJAFgAABJ09RoWLDpblJx3vsimDAprXkdQ8ly/5Fs003VbRtcf1Z5PkXepHXiy1t52Wt3x2W9mLktT34NcslxRzNq9uDz9W+23RHLStvfyNcWWmtMt/wDq4OLUWjOn5E0bep4+qnJJVxUt0dcZQnjqTVf1ueKsj7yt/A6oZ5VyzrhZHHPe/Fd/hYf8WX3DwsN/3k/u3OLxnfL+Q8eXm/kdvqX93LVd8NOONRzzS9Et/iTa8NwfUSaap2k//B5/jPzY8aV8v5Gdyt9s9a27PCw/4s/uLw8PEpaZW2uXz8Dg8Z3y/kHmlXLNd6xqt8nUPxHbT+0p9I37fM45ZbldlfE9TG2uru+kev3j6R/VnD4nqPF9Rteru+kO/wCZH0j+rOHxfUeL6k2dXc+o2/mR9I/qzh8X1Hi+o7L1d30j4fMfSNv5nB4vqT4nqTZ1dz6j+rI+kPz+84Xk9R4nqOx1dv0jatvmPpH9WcPiepHiepNr1d/0j+rMM2a//Jh4nqZznb8xasxbeJ/VjxP6s5tQ1GdtadPif1Y8T+rObUNQ2adcMtP7PM6vpH9WeXGVM18T1LKzcXs4M9wq1xx5keHh51y+CaPPxZmlyy/jS838jpM9MdXd4eH/ABZfcI48UZNxzTTfPHBxeNLzY8Z+f3C5bmqslnp2LFhS/vZbu+xPh4f8SfzWxw+M/MeNLzY72ek1Xd4eH/El68b/AIEeHi/xZfJbHF40vN/IeNLzZe9NV91k9g+xnx0eSP8A055HNn9h+y39TBkx/DK3+89qRy5D144x6Jhi8aXsT2fH9HN/qfyKw9j+zVfiR6iXwyJV9x6eRbmLR16yuup+zDF7I9kxf9xny+uTLX3I6V7J9lSi19Aim3s1klt95OM6Yc7GbhIxcMXEv7O+zXJPw8teSys1X9nfZXPg5f8AVZ6ON7Gjb7HOw1J+HkS/s/7H3vD1F9qz7fuMpew/ZC4w9T/rfyPXnwcs9izCJ0leVk9j+zqqGLKvV5W2Zr2P0PeOV/8AyfyPSkrK9ztMY3jhjPw5MfsX2bfvY87Xpl/kdcfYPseSX5nqb7/n/wCRrDsdeOjnljEyxl/Dz1/Zr2S29+rS/aR/Aq/7M+zu0+pr/rX4HtJbEN7GNOcwkeG/7Oezo76upf8A+6/Ar+RfZMXU8fU/FZf5HrzkcuXk3Mdump+zz/yP7JV+51T8k8q/giH7K9m1Uenyr1eZnU3uTFNs3MJE+ni5sfsb2e+cWR//ACM2j7A9luW8eoS8lk/kdeNbo6sdXuYykXUn4ceP+zvsjS7wZ2+zlndfciZ+w/Y6jX0Oafms0j0bVbFJtnOYsXGV4+b2F7Mf93izQ/8AlbOZ+xOgi93nl6a1+B7E20c03udccY3jjJ+HDH2V7NjerBln/wDK0WXsn2U6/MdR6/nv5HTu2XgjVwi5YY38Mo+xvZUuOlypftma4/YXsve+nk/jkkdMFR0QZzskYmEnpwy9geymq+jTXwyyJ/InsWMdL6LI/wDm8eVnoN7mc3SfNmeu11L+HlZPY3si3XT54+SWb8Uc2X2L7OpvF9ITvhzT/gerMwkzpjhEnHi8v8jdF3ln+yS/A5Or6foIVDBHLJrmTn93B6nWzlDpZyi6qvlZ89ny6W15eTM8mp6Y5bJOsi2bPGKaVJVR52fLbfAzZW/Pv3OSc77nizy25446JS5M7IbKnF2XslMzslMJWupmkZ7UYWWTKzY31jxDCybLtNNtfoNZjYsbNN9foNfoY2LLtNLOQ1GdixtdL2LKWLILWLKWLCr2RZWyLIL2NRSxYXS9kWVsiyGl7I1FbIsKvqIbK2Q2BNk2UBBexZQAXTLajKy1lG0Z1yW1mCZNl2mm2v0Gv0MbFjZptr9BrMbFjZptrGv0MbFjZp+uNuznyM2bo58j3PqYusYze5lyWnuyEdY2tBHTjRhjR0wRjJmtol2RES2ZyZZzZy5Dpyb/ABOSdps6YtRmQuRuEdGm2NHVBV239TDEjrxq+TlkzV48FZ8GlGeTgwy55s5snBvNmGR7M64tRi1ZeFplb3Lx5NtNoXZ0x4MMdHVBbHHJirdisvNlnwZTexmIwys5pcnRk2OaW72O2LcVtmuMyp2bY0WrXRj3OiMTHGjePByrFTKk+DGbo2fmYT5JEjCbdWc0+GzoyM55fVe9evkdY3Hhdf1vje5B1CLtU+fU8jNku/wN8/C37Hn5G/M83Lk8v3XdUyT9TBstLlmbPHlW5ENkAGGgkgkAWTKgIvYsqCotYsqSBaxZUkBYAKhYIBFACAAACgIJIBBJBBAACgAAAAAAAAAAlMWQAJsWQAJsWQAJsWQAP1yZz5DoyI5Zvc+vi6RjO7IQlySlR0aa44tnXCLRz4jqgc8mauuzEnaJ7FJVTObLHI6Oee5tkZzye51xajJstEhstDlG2nTj2OnHI54LZUdMEqujjkxWmoym7L7mc2ZiRz5TnmzpynJM7YtxC5NImae5tHfYtWt8SN48mWKPqbx2drlHHJihnkNWYZNhEjnyswumbZDBvc7RuLdzWDMVuzeC4FK6MZ0RWxjjRv2OOTCstjnm+Tefr5HLkk97GKxjPdnB1nWR6aNPeb4S/eX9odXHpsdqnN8Rv7/gfNdV1E8s5TnK29zdy1Gc8+vie2WaTZw5GXy5Pgc05Hj5M9uUisnuUZLZVnmtbQADKhJAAkAFQJIJKAAAEkAImwQAJsgAAAAoACAACAQCAoAAAAAAAAAAAAAAAAAAAAAAAD9ayydUck3udOZnNI+xi6RRvcmNsquTSCN1pviVHXBbHNDlHVB7HHJirNGU9i7dmc3uZiOfIc8jfK6Oduzti3FS8VwVW5pBFq11YeDdR7mGN7G6d0ca51LZnNbFmzOb2YhGGRnPLg0mzFs7RuCW5viW6MY7s6MezoUrqx8Gq23qzLGrNbs41iqydnPkdG8nSObIMSMJsx7mszN8naOkTA6saOeETpxomSV0QRrdIyxl3yjjWFMjOXIzpyPk8P2r7SjhTw4dMptNNp/V/mahvXmuH21lhLLCMZxk4ppxXZ2fP5pO+TfLl+44smS/kcuTJx32u2WRuzFsvKVmbZ48q3EMgAwoACAAAJBBJQAAQJIAEggkAACgACAAAAAIBAAUIAAAAAAAAAAAAAAAAAAAAAAAAAA/VsrbOaRvklZzybPs4usQuTbGrMY8m+MtWuiETZKimLc3o5ViqNmUuTaWxz5OSRIwyytnO+TbI99jF7s6xuEeTeKMInRjVlpW8VRtFGcF5mq7bHGsDV2c89jplwc2R8lixzTM5ItNlLs6xuLRR0QSRgkdGJbomSVvDk1TookXSvk41iqTdnPkR0S2ObKzWKxzydFL3JmR3O0baxZ0Yzhn1WDBJRzZFFvs1/VGmP2j0V/8RHfu7S+ZzyyjNelAs+UeX1XtfpcHTyeLLHJk30x359fQ+W6jrs2abnlyzlJtPd+XGxzc8spi+h9se1Po14MFPI1vO/q/D1/cfKZ8zdtyTbtsjLmcm5Ntybttu2zjyZG73MZZ6jlbcqZMl/8Ak55SsSlZm2eTLLbcg2VAObQACAAAAAAAACQQAJABUCSABIIAEgEASCAAABAIACgAAAAAAAAAAAAAAAAAAAAAAAAAA/VMiOaZ0ZWc8j7UdYiN2dGJGMeToxkpXTiN+xhA1TOVYQ92YZGrNZnPkGKxhOr5MpF58leTtG4tBbHRjpM54bHRjRMkrpStF7KRe1FtzjWCT2Zy5GbydHPk+JvFY55ozTZpJlKOsbaQ3OjHsYY+TqhuYyZreO8eUW1FI2iWzkypORy5DefByzfPobxajm6jKsGKWSSbUey5Z4vWe15SjGOJTxSv3qab+Zj1ntTPmwSw5scYqW7aXCs8jNO6qbe2zbPPy8/4xXbqzdXLJklKeWbb2dma6l6dGv3X6bnJrq93z5jX2348zy3Kpt1+LK05yt1taMcmW39pjr37/aykpbnSZ/p045Td20lPYwlLcOToo2c8strINlbAMVQAEAAAAAAAAAAAAAAAAEggASCAUSCAQSCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+oTbZk7NJMzvc+1HaLQVs6ccTCHJ0RJklbxL9ikKL06ONYVlwc+R8m8rObIbxWMJlY+RMnuRGrOra8UdOOznhu9zrxpUYyZrWPBeW1ERWxaSOTLHJvZyZH5nVNpI5MjR0xajFkIs0iIrc6NNYHTAxhE6IKjnkzWsbon4hXRDao5ssMvByzveuTpytHD1GfHgjryzUVwvU6YtR8z1GHK8erJDJy5SbXL2TPJyw96WySPp+t9o4MnTZMa8RNpVa2foz57PlTbex5+XCb24268RwytMqaTkvIxbPJZIu1rKtkWQZ2qbKgE2AAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD9PlTM6dlmx5H23ZrjRvBHPE6IcGMma3hFLktIrHku2qOTLGb8uPU5sh0ZNzlnybxajB/WC5JkRFbnVpvBbHTjRzwVpHTBbHPJitlx3ErXLLRqik3fBzRhkOSbOvI1RyZKOmLUUJXKKdzSKOjTpx7HRHdLzs5sZ0x7HHJitNznlkjct3S7s8v2z7X8DV03Tyfi/pTTXu78fE+ey+0M84ThLPNxm7a7P+XpwZjnc5HrdT7ceuSwY1p7Sndv7Dyut66fUz1ySSWyinx5nn5ctbWYyy7VsZvJpztyrXLld9zjnP1E52Ytnmzz21INlGw2QcbWwAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH6YPIErc+27NcfJ1Qic+Nbo6Y9jnkzWkYkSTXJpGqKSV2c2XPI58p0TdHPk8zri1GLJjyR+kXXOxtpvjOmEe5zYzsxrY45MVLuik+DWXBhMzEjnyM55bs2yNO6MJcnbFuI7l4SV15HNn6jH00NWR/BLlnnflaUZNxxK62uV7/gLUuUnt7Wfrun6ZacmRKb7JW16vyPO6723F9KsfTSyRyP60mqaXp+J4ObPKU5Tk25N3b3Od5v6o45ZT8uFzt9L5stuTbtt8tnK8rvn7ymTJZi5s8+fIkjSeT1Zm57FHIizjcmpEtlGw2QYtaAAZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+lF4nW8PTRxSbyKeSt6lw6vbz32K4Iw8COqqeSpvyVbffZ9fvNbdtogdGNmkYRikoxjpljuVO6fKNMCi4LVxrWr4HO57m2Krdozlwdix4dt02l+tzx8u5g9KjPTpTV6ZN9jEzRw5HZzzOzqklllSrZNrydHHNHow8xuM+5rAzo1gjVWunGtjePBjjRvFeZxyc6l8GGZvQ9PNFc/X9JgyPFmzwhNR1NO+P67Hhe1va8ciWPo8j0v60lab9PgSJcpHS8umTetJL6zb2S8zy+p9q5ZTaxy8OF7Ut/meZLKrdLlUc+XL5WLlqOfe+o7Op6ued6smTV6cI4p5t+zMnkdcsxlk35Zxy5Gdb9tsmS/Ix1lJSv1KWcLm3ImUilhsqc7WktkAE2AAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//Z'

const CSS = `
html{background:#0a0e18!important}
html body{${lr}}
html body[data-ds-dark-theme]{${dr}}
html body{background-color:#0a0e18!important;background-image:linear-gradient(180deg,rgba(8,11,19,.30),rgba(8,11,19,.46)),url("data:image/jpeg;base64,${WALL}")!important;background-size:cover!important;background-position:center 20%!important;background-repeat:no-repeat!important;background-attachment:fixed!important}
html>body>div:first-child{background-color:rgba(0,0,0,0)!important;background-image:none!important}
.dts-root{position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:hidden}
.dts-pet{position:absolute;right:26px;bottom:22px;width:180px;height:180px;pointer-events:auto;cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none}
.dts-pet.drag{cursor:grabbing}
.dts-slimewrap{position:absolute;left:50%;bottom:6px;width:160px;height:130px;transform:translateX(-50%);transform-origin:50% 100%}
.dts-slimewrap img{display:block;width:140px;height:auto;margin:0 auto;image-rendering:pixelated;filter:drop-shadow(0 6px 4px rgba(0,0,0,.38));animation:dts-breathe 2.6s ease-in-out infinite}
.dts-pet.hop .dts-slimewrap img{animation:dts-hop .5s cubic-bezier(.33,.9,.4,1)}
.dts-pet.dead .dts-slimewrap img{animation:dts-splat 1s ease-out forwards}
.dts-pet.fall .dts-slimewrap{animation:dts-fall .8s cubic-bezier(.3,.8,.5,1) both}
@keyframes dts-breathe{0%,100%{transform:translateY(0) scale(1,1)}50%{transform:translateY(-2px) scale(1.02,.97)}}
@keyframes dts-hop{0%{transform:translateY(0) scale(1,1)}22%{transform:translateY(-40px) scale(.97,1.16)}48%{transform:translateY(2px) scale(1.12,.82)}70%{transform:translateY(-12px) scale(.99,1.06)}100%{transform:translateY(0) scale(1,1)}}
@keyframes dts-splat{0%{transform:scale(1,1);opacity:1}25%{transform:translateY(6px) scale(1.5,.35);opacity:.9}55%{transform:translateY(8px) scale(.55,.15);opacity:.55}100%{transform:translateY(12px) scale(.2,.1);opacity:0}}
@keyframes dts-fall{0%{transform:translate(-50%,-130vh) scale(.9,.9);opacity:.2}30%{transform:translate(-50%,-4vh) scale(1,1);opacity:1}55%{transform:translate(-50%,0) scale(1.08,.85)}75%{transform:translate(-50%,-8px) scale(.97,1.08)}100%{transform:translate(-50%,0) scale(1,1)}}
.dts-shadow{position:absolute;left:50%;bottom:4px;width:92px;height:13px;transform:translateX(-50%);border-radius:50%;background:rgba(0,0,0,.35);filter:blur(2px)}
.dts-pet.dead .dts-shadow{opacity:0}
.dts-label{position:absolute;top:0;left:50%;transform:translateX(-50%);white-space:nowrap;font-family:'Courier New',monospace;font-size:10px;color:#ffe9b0;text-shadow:0 1px 2px rgba(0,0,0,.9);pointer-events:none}
.dts-hint{position:absolute;top:22px;left:50%;transform:translateX(-50%);white-space:nowrap;font-family:'Courier New',monospace;font-size:10px;color:#ffe9b0;opacity:0;animation:dts-hint 7s ease-out forwards;text-shadow:0 1px 2px rgba(0,0,0,.9)}
@keyframes dts-hint{0%,60%{opacity:1}100%{opacity:0}}
.dts-bag{position:absolute;bottom:14px;left:12px;display:flex;align-items:center;gap:1px;padding:3px 8px 3px 6px;background:rgba(8,12,22,.85);border:1px solid rgba(227,185,60,.8);border-radius:3px;font-family:'Courier New',monospace;font-size:11px;color:#ffe2a0;pointer-events:none;z-index:2}
.dts-bag img{width:14px;height:14px;image-rendering:pixelated}
.dts-gel{position:absolute;bottom:14px;left:12px;transform:translateY(-34px);display:flex;align-items:center;gap:2px;padding:2px 7px 2px 5px;background:rgba(8,12,22,.85);border:1px solid rgba(180,220,120,.8);border-radius:3px;font-family:'Courier New',monospace;font-size:11px;color:#d8f4ae;pointer-events:none;z-index:2}
.dts-gel img{width:14px;height:auto;image-rendering:pixelated}
/* All in-pet FX are anchored to the pet box, so drops never drift */
.dts-pop{position:absolute;left:50%;top:36px;width:0;height:0;pointer-events:none;z-index:5}
.dts-pop img{position:absolute;left:0;top:0;width:19px;height:19px;image-rendering:pixelated;animation:dts-coinfly 1.05s ease-out forwards;filter:drop-shadow(0 0 2px rgba(255,220,120,.8))}
.dts-pop img.gel{width:22px;height:auto}
@keyframes dts-coinfly{0%{opacity:0;transform:translate(0,0) scale(.4) rotate(0)}14%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1) rotate(200deg)}}
.dts-float{position:absolute;left:50%;top:6px;transform:translateX(-50%);pointer-events:none;font-family:'Courier New',monospace;font-size:12px;font-weight:bold;color:#ffe08a;text-shadow:0 1px 2px rgba(0,0,0,.9);animation:dts-up 1s ease-out forwards;z-index:5}
@keyframes dts-up{0%{opacity:0}12%{opacity:1}100%{opacity:0;transform:translate(-50%,-42px)}}
`

const COIN = (v: number): string => (v >= 10000 ? GO : v >= 100 ? SI : CU)
const div = (cls: string, style: Record<string, string | number> | null, children: unknown): unknown =>
  createElement('div', { className: cls, style: style || null }, children)
const span = (cls: string, style: Record<string, string | number> | null, children?: unknown): unknown =>
  createElement('span', { className: cls, style: style || null }, children)
const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))
const rand = (a: number, b: number): number => a + Math.random() * (b - a)

function WalletChip(props: { cu: number }): unknown {
  const g = Math.floor(props.cu / 10000)
  const rem = props.cu % 10000
  const s = Math.floor(rem / 100)
  const c = rem % 100
  const kids: unknown[] = []
  const add = (n: number, src: string, key: string): void => { for (let i = 0; i < Math.min(n, 9); i++) kids.push(createElement('img', { key: key + i, src, alt: '' })) }
  if (g > 0) add(g, GO, 'g')
  if (s > 0) add(s, SI, 's')
  if (c > 0) add(c, CU, 'c')
  if (kids.length === 0) kids.push(createElement('span', { key: 'e', style: { color: '#b9a878' } }, '0'))
  if (g > 9) kids.push(createElement('span', { key: 'gx' }, '×' + g))
  if (s > 9) kids.push(createElement('span', { key: 'sx' }, '×' + s))
  if (c > 9) kids.push(createElement('span', { key: 'cx' }, '×' + c))
  return div('dts-bag', null, kids)
}

function SkinRoot(): unknown {
  const [sp, setSp] = useState(0)
  const [wallet, setWallet] = useState(0)
  const [gels, setGels] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'dead' | 'fall'>('idle')
  const [pop, setPop] = useState<{ id: string; parts: unknown[] } | null>(null)
  const [floatTxt, setFloatTxt] = useState<{ id: string; text: string } | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [drag, setDrag] = useState<{ px: number; py: number; bx: number; by: number; w: number; h: number; fw: number; fh: number; moved: boolean } | null>(null)
  const timeouts: number[] = []
  const later = (fn: () => void, ms: number): void => { timeouts.push(window.setTimeout(fn, ms)) }

  const kill = (): void => {
    if (phase !== 'idle') return
    setPhase('dead')
    const spec = SPECIES[sp]
    const n = 1 + Math.floor(Math.random() * 3)
    let total = 0
    const parts: unknown[] = []
    for (let i = 0; i < n; i++) {
      const v = Math.floor(rand(spec.min, spec.max + 1))
      total += v
      const a = rand(0.4, Math.PI - 0.4)
      const dist = rand(24, 66)
      parts.push(createElement('img', {
        key: 'c' + i,
        src: COIN(v),
        alt: '',
        style: { '--dx': (Math.cos(a) * dist).toFixed(0) + 'px', '--dy': (Math.sin(a) * dist * -1 - 26).toFixed(0) + 'px', animationDelay: (i * 0.05).toFixed(2) + 's' },
      }))
    }
    if (Math.random() < spec.gel) {
      setGels((x) => x + (1 + Math.floor(Math.random() * 3)))
      parts.push(createElement('img', {
        key: 'g', className: 'gel', src: GEL, alt: '',
        style: { '--dx': rand(-22, 22).toFixed(0) + 'px', '--dy': rand(-48, -22).toFixed(0) + 'px' },
      }))
    }
    if (Math.random() < (spec.g || 0)) total += 10000
    setWallet((w) => w + total)
    setPop({ id: 'd' + Date.now(), parts })
    setFloatTxt({ id: 'f' + Date.now(), text: (total > 0 ? '+' + total + (total >= 10000 ? '金' : total >= 100 ? '银' : '铜') : '') + (parts.length > n ? ' 凝胶' : '') })
    later(() => { setPop(null); setFloatTxt(null) }, 1250)
    later(() => { setSp(Math.floor(Math.random() * SPECIES.length)); setPhase('fall'); later(() => setPhase('idle'), 900) }, 1300)
  }
  const onMenu = (e: React.MouseEvent): void => {
    e.preventDefault()
    if (phase === 'idle') { setSp((sp + 1) % SPECIES.length); setPhase('fall'); later(() => setPhase('idle'), 900) }
  }
  const onDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (e.button !== 0 || phase !== 'idle') return
    const t = e.currentTarget
    try { t.setPointerCapture(e.pointerId) } catch (err) { /* ignore */ }
    const fr = t.parentElement?.getBoundingClientRect()
    const r = t.getBoundingClientRect()
    if (!fr) return
    const bx = pos ? pos.x : fr.width - r.width - 26
    const by = pos ? pos.y : fr.height - r.height - 22
    setPos({ x: bx, y: by })
    setDrag({ px: e.clientX, py: e.clientY, bx, by, w: r.width, h: r.height, fw: fr.width, fh: fr.height, moved: false })
  }
  const onMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!drag) return
    const dx = e.clientX - drag.px
    const dy = e.clientY - drag.py
    const moved = drag.moved || Math.abs(dx) > 4 || Math.abs(dy) > 4
    setDrag({ px: drag.px, py: drag.py, bx: drag.bx, by: drag.by, w: drag.w, h: drag.h, fw: drag.fw, fh: drag.fh, moved })
    setPos({ x: clamp(drag.bx + dx, 0, drag.fw - drag.w), y: clamp(drag.by + dy, 0, drag.fh - drag.h) })
  }
  const onUp = (): void => { const m = drag ? drag.moved : false; setDrag(null); if (!m) kill() }

  const spec = SPECIES[sp]
  const petKids: unknown[] = [
    span('dts-label', null, spec.n),
    span('dts-shadow', null),
  ]
  if (pop) petKids.push(div('dts-pop', { key: pop.id }, pop.parts))
  if (floatTxt) petKids.push(span('dts-float', { key: floatTxt.id }, floatTxt.text))
  if (!pos && phase === 'idle') petKids.push(span('dts-hint', null, '单击击杀 · 新史莱姆从天空刷新 · 右键换物种'))
  petKids.push(div('dts-slimewrap', null, createElement('img', { key: 'sl' + sp, src: S[spec.i], alt: '', draggable: false })))

  const boxStyle = pos ? { left: pos.x + 'px', top: pos.y + 'px', right: 'auto' as const, bottom: 'auto' as const } : null
  const extra: unknown[] = [createElement('div', {
    key: 'pet',
    className: 'dts-pet' + (phase === 'dead' ? ' dead' : '') + (phase === 'fall' ? ' fall' : '') + (drag ? ' drag' : ''),
    style: boxStyle,
    title: spec.n + ' · 点击击杀（之后从天空刷新）',
    onPointerDown: onDown,
    onPointerMove: onMove,
    onPointerUp: onUp,
    onPointerCancel: onUp,
    onContextMenu: onMenu,
    onClick: (): void => kill(),
  }, petKids)]
  extra.push(createElement(WalletChip, { cu: wallet, key: 'bag' }))
  if (gels > 0) extra.push(div('dts-gel', { key: 'gel' }, [createElement('img', { src: GEL, alt: '' }), createElement('span', null, '凝胶 × ' + gels)]))
  return div('dts-root', null, extra)
}

/**
 * Client plugin body: inject the global stylesheet (palette + wallpaper) and
 * mount the pet skin as a single React root on document.body. Every timer is
 * owned by component state cleanup-free simple timeouts; dispose removes both
 * DOM nodes on plugin disable.
 */
export function apply(ctx: { effect?: (cb: () => (() => void) | void, label?: string) => unknown }): void {
  const styleEl = document.createElement('style')
  styleEl.setAttribute('data-dsh-terraria-skin', '')
  styleEl.textContent = CSS
  document.head.appendChild(styleEl)

  const host = document.createElement('div')
  host.setAttribute('data-dsh-terraria-skin', 'root')
  document.body.appendChild(host)
  const root = createRoot(host)
  root.render(createElement(SkinRoot, null))

  if (typeof ctx?.effect === 'function') {
    ctx.effect(() => () => {
      root.unmount()
      host.remove()
      styleEl.remove()
    }, 'terraria-skin: teardown')
  }
}
