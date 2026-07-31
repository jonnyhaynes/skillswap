import type { User } from '@/types'

type NamedUser = Pick<User, 'firstName' | 'lastName'>

/** "Alex Chen" → "Alex C." — the form shown on public, unauthenticated pages. */
export function shortName(user: NamedUser): string {
  const initial = user.lastName?.charAt(0)
  return initial ? `${user.firstName} ${initial}.` : user.firstName
}

export function fullName(user: NamedUser): string {
  return `${user.firstName} ${user.lastName}`.trim()
}

/**
 * Surnames are only shown to signed-in members. Anonymous visitors and
 * crawlers see the shortened form used on the browse cards.
 */
export function displayName(user: NamedUser, isAuthenticated: boolean): string {
  return isAuthenticated ? fullName(user) : shortName(user)
}
