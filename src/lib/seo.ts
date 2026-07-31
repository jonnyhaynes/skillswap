// Central SEO constants and head-tag management.
//
// The app is client-rendered, so every tag here is written imperatively into
// document.head. `scripts/prerender.mjs` snapshots the rendered DOM at build
// time, which is what makes these tags visible to crawlers that don't execute
// JavaScript. Keep the defaults in index.html in sync with the DEFAULT_*
// values below — index.html is what a non-prerendered route serves cold.

export const SITE_NAME = 'SkillSwap'

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://skillswap.colouringcode.com'
).replace(/\/+$/, '')

export const DEFAULT_TITLE = 'SkillSwap — Swap Skills With Your Neighbours'

export const DEFAULT_DESCRIPTION =
  'SkillSwap is a neighbourhood skill exchange. Offer what you know, learn what you need, and swap skills with people nearby — no money, just knowledge and time.'

// Social scrapers don't rasterise SVG, so this must stay a PNG.
// Regenerate with `node scripts/generate-og-image.mjs`.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

export const TWITTER_CARD = 'summary_large_image'

/** Resolve a path or absolute URL to an absolute site URL, without query or hash. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

/** Collapse whitespace and clip to a length search engines will actually show. */
export function truncateDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const clipped = clean.slice(0, max - 1)
  const lastSpace = clipped.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`
}

/** Page titles read "<page> | SkillSwap"; the home page uses the bare default. */
export function formatTitle(title?: string): string {
  if (!title) return DEFAULT_TITLE
  return title.endsWith(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
}
