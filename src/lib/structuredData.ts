// JSON-LD builders. Each returns a plain object that `useSeo({ jsonLd })`
// serialises into a <script type="application/ld+json"> tag.

import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/seo'

const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: DEFAULT_OG_IMAGE,
    description: DEFAULT_DESCRIPTION,
  }
}

export function webSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en-GB',
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/browse?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  }
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

interface SkillListingSchemaInput {
  id: string
  title: string
  description: string
  categoryLabel: string
  listingType: 'offered' | 'wanted'
  isRemote: boolean
  providerName: string
  providerId: string
  neighbourhood?: string | null
}

/**
 * An offered listing is a Service someone provides; a wanted listing is a
 * Demand for one. Both hang off the same provider Person.
 */
export function skillListingSchema(listing: SkillListingSchemaInput) {
  const provider = {
    '@type': 'Person',
    '@id': `${SITE_URL}/profile/${listing.providerId}#person`,
    name: listing.providerName,
    url: `${SITE_URL}/profile/${listing.providerId}`,
  }

  const areaServed = listing.neighbourhood
    ? { '@type': 'Place', name: listing.neighbourhood }
    : undefined

  if (listing.listingType === 'wanted') {
    return {
      '@type': 'Demand',
      name: listing.title,
      description: listing.description,
      url: `${SITE_URL}/skills/${listing.id}`,
      category: listing.categoryLabel,
      seller: provider,
      ...(areaServed ? { availableAtOrFrom: areaServed } : {}),
    }
  }

  return {
    '@type': 'Service',
    name: listing.title,
    description: listing.description,
    url: `${SITE_URL}/skills/${listing.id}`,
    serviceType: listing.categoryLabel,
    category: listing.categoryLabel,
    provider,
    ...(areaServed ? { areaServed } : {}),
    ...(listing.isRemote ? { availableChannel: { '@type': 'ServiceChannel', name: 'Remote' } } : {}),
  }
}

interface PersonSchemaInput {
  id: string
  name: string
  bio?: string | null
  avatarUrl?: string | null
  neighbourhood?: string | null
  averageRating?: number
  totalReviews?: number
}

export function personSchema(person: PersonSchemaInput) {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/profile/${person.id}#person`,
    name: person.name,
    url: `${SITE_URL}/profile/${person.id}`,
    ...(person.bio ? { description: person.bio } : {}),
    ...(person.avatarUrl ? { image: person.avatarUrl } : {}),
    ...(person.neighbourhood
      ? { homeLocation: { '@type': 'Place', name: person.neighbourhood } }
      : {}),
    ...(person.totalReviews && person.averageRating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(person.averageRating.toFixed(1)),
            reviewCount: person.totalReviews,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    memberOf: { '@id': ORGANIZATION_ID },
  }
}

/** Wraps one or more schemas in a single @graph document. */
export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes }
}
