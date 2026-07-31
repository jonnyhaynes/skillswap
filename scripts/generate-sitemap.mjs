// Generates dist/sitemap.xml.
//
// Static routes are always emitted. Skill listings and member profiles are
// pulled from Supabase with the anon key — the same read a logged-out visitor
// makes — so the sitemap only ever contains genuinely public URLs. If Supabase
// is unreachable the build still succeeds with the static routes alone.

import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.production', quiet: true })
loadEnv({ path: '.env.local', quiet: true })
loadEnv({ quiet: true })

const SITE_URL = (process.env.VITE_SITE_URL || 'https://skillswap.colouringcode.com').replace(
  /\/+$/,
  ''
)

const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/browse', changefreq: 'hourly', priority: '0.9' },
  { path: '/signup', changefreq: 'monthly', priority: '0.8' },
  { path: '/faq', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'yearly', priority: '0.4' },
  { path: '/terms', changefreq: 'yearly', priority: '0.2' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.2' },
]

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case "'":
        return '&apos;'
      default:
        return '&quot;'
    }
  })
}

const PAGE_SIZE = 1000

/** PostgREST caps a response at 1000 rows by default, so page until exhausted. */
async function fetchPublicRows(table, columns) {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null

  const base = `${url.replace(/\/+$/, '')}/rest/v1/${table}?select=${columns}&order=id`
  const rows = []

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const response = await fetch(`${base}&limit=${PAGE_SIZE}&offset=${offset}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (!response.ok) {
      throw new Error(`${table}: HTTP ${response.status} ${await response.text()}`)
    }
    const page = await response.json()
    rows.push(...page)
    if (page.length < PAGE_SIZE) return rows
  }
}

function urlEntry({ path, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${escapeXml(SITE_URL + path)}</loc>`,
    lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')
}

async function main() {
  const entries = [...STATIC_ROUTES]

  try {
    const listings = await fetchPublicRows('skill_listings', 'id,updated_at')
    if (listings) {
      listings.forEach((row) => {
        entries.push({
          path: `/skills/${row.id}`,
          lastmod: row.updated_at ?? undefined,
          changefreq: 'weekly',
          priority: '0.8',
        })
      })
      console.log(`[sitemap] ${listings.length} skill listings`)
    }

    const profiles = await fetchPublicRows('profiles', 'id,updated_at')
    if (profiles) {
      profiles.forEach((row) => {
        entries.push({
          path: `/profile/${row.id}`,
          lastmod: row.updated_at ?? undefined,
          changefreq: 'weekly',
          priority: '0.5',
        })
      })
      console.log(`[sitemap] ${profiles.length} member profiles`)
    }

    if (!listings && !profiles) {
      console.warn('[sitemap] Supabase env vars missing — static routes only')
    }
  } catch (error) {
    console.warn(`[sitemap] dynamic URLs skipped: ${error.message}`)
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(urlEntry),
    '</urlset>',
    '',
  ].join('\n')

  const outPath = resolve('dist/sitemap.xml')
  await writeFile(outPath, xml, 'utf8')
  console.log(`[sitemap] wrote ${entries.length} URLs to ${outPath}`)
}

await main()
