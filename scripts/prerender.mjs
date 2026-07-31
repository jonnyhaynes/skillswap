// Build-time prerendering for the public, content-bearing routes.
//
// The app is a client-rendered SPA, so `dist/index.html` ships an empty
// #root — crawlers that don't execute JavaScript (social scrapers, most AI
// crawlers) see nothing. This script boots the built bundle in a real browser,
// waits for each route to render, and writes the resulting HTML to disk.
//
// React still takes over on load: `createRoot().render()` replaces the
// container's contents, so there is no hydration contract to honour and no
// mismatch to worry about. The snapshot exists purely for crawlers.
//
// Output layout (see the matching rewrites in vercel.json):
//   dist/index.html   prerendered home page
//   dist/app.html     the untouched SPA shell, used as the catch-all fallback
//   dist/browse.html  prerendered /browse, and so on

import { spawn, spawnSync } from 'node:child_process'
import { copyFile, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'

const PORT = Number(process.env.PRERENDER_PORT || 4183)
const ORIGIN = `http://localhost:${PORT}`

// Only routes whose content is the same for every visitor. Anything behind
// auth, or personalised, stays client-rendered.
const ROUTES = [
  { path: '/', out: 'index.html' },
  { path: '/browse', out: 'browse.html' },
  { path: '/faq', out: 'faq.html' },
  { path: '/contact', out: 'contact.html' },
  { path: '/terms', out: 'terms.html' },
  { path: '/privacy', out: 'privacy.html' },
]

const dist = (file) => resolve('dist', file)

/**
 * If something else already holds the port, `vite preview --strictPort` exits
 * and we would silently snapshot whatever that other server is serving — a
 * stale bundle. Refuse to run instead.
 */
async function assertPortFree() {
  try {
    await fetch(ORIGIN, { method: 'HEAD', signal: AbortSignal.timeout(2000) })
  } catch {
    return // Nothing listening, which is what we want.
  }
  throw new Error(
    `something is already listening on ${ORIGIN} — stop it, or set PRERENDER_PORT to a free port`
  )
}

async function waitForServer(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(ORIGIN, { method: 'HEAD' })
      if (response.ok) return
    } catch {
      // Server not up yet.
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`preview server did not start on ${ORIGIN}`)
}

function startPreviewServer() {
  const child = spawn(
    'npx',
    ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'],
    { stdio: ['ignore', 'ignore', 'inherit'] }
  )
  child.on('error', (error) => {
    console.error('[prerender] preview server failed:', error.message)
    process.exitCode = 1
  })
  return child
}

/**
 * useSeo writes the canonical tag for the current route, so a canonical
 * matching the route we asked for proves React mounted and this page's SEO
 * effect ran — a far more reliable signal than a fixed timeout.
 */
async function waitForRoute(page, path) {
  await page.waitForFunction(
    (expected) => {
      const root = document.getElementById('root')
      if (!root || root.childElementCount === 0) return false
      const canonical = document.querySelector('link[rel="canonical"]')
      if (!canonical) return false
      const href = canonical.getAttribute('href') || ''
      const pathname = href.replace(/^https?:\/\/[^/]+/, '') || '/'
      return pathname === expected
    },
    path,
    { timeout: 20_000 }
  )
}

async function main() {
  // Preserve the pristine shell before the home page snapshot overwrites
  // dist/index.html — it becomes the fallback for every non-prerendered route.
  // This must happen even when prerendering is skipped, or vercel.json's
  // catch-all rewrite to /app.html would 404 every client-rendered route.
  await copyFile(dist('index.html'), dist('app.html'))

  if (process.env.SKIP_PRERENDER === '1') {
    console.warn('[prerender] SKIP_PRERENDER=1 — shipping the plain SPA shell for every route')
    return
  }

  // CI and Vercel build images install node_modules but not browser binaries.
  // Local runs already have it, where this is a fast no-op.
  const install = spawnSync('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit' })
  if (install.status !== 0) {
    throw new Error('could not install chromium — set SKIP_PRERENDER=1 to build without prerendering')
  }

  await assertPortFree()

  const server = startPreviewServer()
  let browser

  try {
    await waitForServer()
    browser = await chromium.launch()
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await context.newPage()

    for (const route of ROUTES) {
      await page.goto(`${ORIGIN}${route.path}`, { waitUntil: 'networkidle', timeout: 30_000 })

      try {
        await waitForRoute(page, route.path)
      } catch {
        // A route that never settles would otherwise be written as an empty
        // shell, which is worse than shipping the plain SPA fallback.
        throw new Error(`${route.path} did not finish rendering — aborting prerender`)
      }

      const html = `<!doctype html>\n${await page.evaluate(() => document.documentElement.outerHTML)}\n`
      await writeFile(dist(route.out), html, 'utf8')
      console.log(`[prerender] ${route.path} → dist/${route.out} (${Math.round(html.length / 1024)} KB)`)
    }
  } finally {
    await browser?.close()
    server.kill('SIGTERM')
  }

  // Cheap guard against silently shipping empty shells.
  const home = await readFile(dist('index.html'), 'utf8')
  if (!home.includes('Teach what you know')) {
    throw new Error('home page snapshot is missing its hero copy — prerender produced an empty shell')
  }
}

await main()
