import { useEffect } from 'react'
import { useLocation } from 'react-router'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  TWITTER_CARD,
  absoluteUrl,
  formatTitle,
} from '@/lib/seo'

export interface SeoOptions {
  /** Page title, without the " | SkillSwap" suffix. Omit for the site default. */
  title?: string
  description?: string
  /** Canonical path (e.g. "/browse") or absolute URL. Defaults to the current pathname. */
  canonical?: string
  /** Absolute URL of the share image. Defaults to the site OG image. */
  image?: string
  type?: 'website' | 'article' | 'profile'
  /** Keep private and duplicate-prone pages out of the index. */
  noindex?: boolean
  /** JSON-LD document(s) to inject for this page. */
  jsonLd?: object | object[]
}

const JSON_LD_MARKER = 'data-seo-jsonld'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  const selector = `link[rel="${rel}"]`
  let el = document.head.querySelector<HTMLLinkElement>(selector)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Writes this route's title, description, canonical, robots, Open Graph and
 * Twitter tags into document.head.
 *
 * Every field is written on every call — including the defaults — so tags never
 * bleed from one route to the next. Call it once per page component.
 */
export function useSeo(options: SeoOptions) {
  const { pathname } = useLocation()
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    canonical,
    image = DEFAULT_OG_IMAGE,
    type = 'website',
    noindex = false,
    jsonLd,
  } = options

  const resolvedTitle = formatTitle(title)
  // Query strings produce duplicate URLs for the same content, so the canonical
  // is always the bare path.
  const resolvedCanonical = absoluteUrl(canonical ?? pathname)
  const resolvedImage = absoluteUrl(image)
  const serialisedJsonLd = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    document.title = resolvedTitle

    upsertMeta('name', 'description', description)
    upsertMeta(
      'name',
      'robots',
      noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'
    )
    upsertLink('canonical', resolvedCanonical)

    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:locale', 'en_GB')
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:title', resolvedTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', resolvedCanonical)
    upsertMeta('property', 'og:image', resolvedImage)

    upsertMeta('name', 'twitter:card', TWITTER_CARD)
    upsertMeta('name', 'twitter:title', resolvedTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', resolvedImage)
  }, [resolvedTitle, description, resolvedCanonical, resolvedImage, type, noindex])

  useEffect(() => {
    // JSON-LD is route-specific, so it is replaced wholesale rather than upserted.
    document.head
      .querySelectorAll(`script[${JSON_LD_MARKER}]`)
      .forEach((node) => node.remove())

    if (!serialisedJsonLd) return

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute(JSON_LD_MARKER, '')
    script.textContent = serialisedJsonLd
    document.head.appendChild(script)

    return () => script.remove()
  }, [serialisedJsonLd])
}

/** Absolute URL for a route path — handy when building JSON-LD. */
export function routeUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
