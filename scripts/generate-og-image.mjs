// One-off generator for public/og-image.png (1200x630).
//
// Social scrapers won't render SVG, so the share image has to be a raster file.
// Run with `node scripts/generate-og-image.mjs` and commit the result — it is
// not part of the normal build.

import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'

const HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <link href="https://fonts.bunny.net/css2?family=Sora:wght@600;800&family=Plus+Jakarta+Sans:wght@500;600&display=swap" rel="stylesheet" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1200px;
        height: 630px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 88px;
        background: radial-gradient(120% 120% at 0% 0%, #11554c 0%, #0b3b35 45%, #08201d 100%);
        color: #fff;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        position: relative;
        overflow: hidden;
      }
      .glow {
        position: absolute;
        border-radius: 999px;
        filter: blur(90px);
        opacity: 0.55;
      }
      .glow-a { width: 520px; height: 520px; background: #43c1a6; top: -180px; right: -120px; }
      .glow-b { width: 420px; height: 420px; background: #6366f1; bottom: -200px; left: -80px; opacity: 0.4; }
      .brand {
        display: flex;
        align-items: center;
        gap: 16px;
        font-family: 'Sora', system-ui, sans-serif;
        font-weight: 800;
        font-size: 34px;
        letter-spacing: -0.02em;
        margin-bottom: 44px;
        position: relative;
      }
      .mark {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: linear-gradient(135deg, #43c1a6, #21a68d);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
      }
      h1 {
        font-family: 'Sora', system-ui, sans-serif;
        font-weight: 800;
        font-size: 82px;
        line-height: 1.05;
        letter-spacing: -0.035em;
        position: relative;
      }
      .accent {
        background: linear-gradient(100deg, #79d9c2, #43c1a6 45%, #6ee7d5);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      p {
        margin-top: 32px;
        font-size: 30px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.72);
        position: relative;
      }
      .url {
        position: absolute;
        left: 88px;
        bottom: 68px;
        font-size: 24px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.5);
        letter-spacing: 0.01em;
      }
    </style>
  </head>
  <body>
    <div class="glow glow-a"></div>
    <div class="glow glow-b"></div>
    <div class="brand"><span class="mark">⇄</span> SkillSwap</div>
    <h1>Learn what you need.<br /><span class="accent">Teach what you know.</span></h1>
    <p>Swap skills with your neighbours — no money, just knowledge and time.</p>
    <div class="url">skillswap.colouringcode.com</div>
  </body>
</html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.setContent(HTML, { waitUntil: 'networkidle' })
// Give webfonts a beat to swap in before the shot.
await page.evaluate(() => document.fonts.ready)
const buffer = await page.screenshot({ type: 'png' })
await browser.close()

const outPath = resolve('public/og-image.png')
await writeFile(outPath, buffer)
console.log(`[og-image] wrote ${outPath} (${Math.round(buffer.length / 1024)} KB)`)
