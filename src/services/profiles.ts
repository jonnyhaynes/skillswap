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

/**
 * Get a single profile by user ID
 */
export async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw new ProfileServiceError(error.message, error.code)
  }

  return mapProfileToUser(data)
}

/**
 * Get multiple profiles by their IDs
 */
export async function getProfilesByIds(userIds: string[]): Promise<User[]> {
  if (userIds.length === 0) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds)

  if (error) {
    throw new ProfileServiceError(error.message, error.code)
  }

  return data.map(mapProfileToUser)
}

/**
 * Update a user's profile
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
    .select()
    .single()

  if (error) {
    throw new ProfileServiceError(error.message, error.code)
  }

  return mapProfileToUser(data)
}

/**
 * Search profiles by neighbourhood
 */
export async function getProfilesByNeighbourhood(
  neighbourhood: string
): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('neighbourhood', `%${neighbourhood}%`)

  if (error) {
    throw new ProfileServiceError(error.message, error.code)
  }

  return data.map(mapProfileToUser)
}

/**
 * Get all profiles (for admin/discovery purposes)
 */
export async function getAllProfiles(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('joined_at', { ascending: false })

  if (error) {
    throw new ProfileServiceError(error.message, error.code)
  }

  return data.map(mapProfileToUser)
}
