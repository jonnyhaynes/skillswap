// Profile service - Supabase operations for user profiles

import { supabase } from '@/lib/supabase'
import { mapProfileToUser, mapUserToProfileUpdate } from '@/lib/typeMappers'
import type { User } from '@/types'

export class ProfileServiceError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ProfileServiceError'
    this.code = code
  }
}

// Columns safe to return to any authenticated caller.
// email and postcode are intentionally excluded — they are PII accessible only
// to the profile owner via the get_own_profile_pii() RPC function
// (see migration 018_profile_pii_access_control.sql).
const PUBLIC_PROFILE_COLUMNS =
  'id, first_name, last_name, avatar_url, bio, neighbourhood, is_verified_neighbour, joined_at, last_seen_at'

/**
 * Merge the authenticated user's own email and postcode into a User object.
 * Calls the get_own_profile_pii() SECURITY DEFINER function which only returns
 * data when the caller is the profile owner.
 */
async function mergeOwnPii(user: User): Promise<User> {
  const { data } = await supabase.rpc('get_own_profile_pii')
  if (data && data.length > 0) {
    user.email = data[0].email ?? undefined
    user.postcode = data[0].postcode ?? undefined
  }
  return user
}

/**
 * Get a single profile by user ID (public columns only — no PII).
 * Use getOwnProfile() when fetching the currently authenticated user's profile.
 */
export async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new ProfileServiceError(error.message, error.code)
  }

  return mapProfileToUser(data)
}

/**
 * Get the authenticated user's own profile including PII (email, postcode).
 * Should only be called for the currently logged-in user.
 */
export async function getOwnProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new ProfileServiceError(error.message, error.code)
  }

  return mergeOwnPii(mapProfileToUser(data))
}

/**
 * Get multiple profiles by their IDs (public columns only — no PII).
 */
export async function getProfilesByIds(userIds: string[]): Promise<User[]> {
  if (userIds.length === 0) return []

  const { data, error } = await supabase
    .from('profiles')
    .select(PUBLIC_PROFILE_COLUMNS)
    .in('id', userIds)

  if (error) {
    throw new ProfileServiceError(error.message, error.code)
  }

  return data.map(mapProfileToUser)
}

/**
 * Update a user's profile and return the updated record with PII.
 */
export async function updateProfile(
  userId: string,
  updates: Partial<User>
): Promise<User> {
  const dbUpdates = mapUserToProfileUpdate(updates)

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId)
    .select(PUBLIC_PROFILE_COLUMNS)
    .single()

  if (error) {
    throw new ProfileServiceError(error.message, error.code)
  }

  return mergeOwnPii(mapProfileToUser(data))
}

/**
 * Search profiles by neighbourhood (public columns only — no PII).
 */
export async function getProfilesByNeighbourhood(
  neighbourhood: string
): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PUBLIC_PROFILE_COLUMNS)
    .ilike('neighbourhood', `%${neighbourhood}%`)

  if (error) {
    throw new ProfileServiceError(error.message, error.code)
  }

  return data.map(mapProfileToUser)
}

/**
 * Get all profiles (public columns only — no PII).
 */
export async function getAllProfiles(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PUBLIC_PROFILE_COLUMNS)
    .order('joined_at', { ascending: false })

  if (error) {
    throw new ProfileServiceError(error.message, error.code)
  }

  return data.map(mapProfileToUser)
}

/**
 * Get the total count of users/profiles.
 */
export async function getUserCount(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  if (error) {
    throw new ProfileServiceError(error.message, error.code)
  }

  return count ?? 0
}
