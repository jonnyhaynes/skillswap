// Skills service - Supabase operations for skill listings

import { supabase } from '@/lib/supabase'
import {
  mapDbSkillToListing,
  mapListingToDbInsert,
  mapListingToDbUpdate,
} from '@/lib/typeMappers'
import type { SkillListing, SkillCategory } from '@/types'

export class SkillsServiceError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'SkillsServiceError'
    this.code = code
  }
}

/**
 * Get all skill listings with optional filters
 */
export async function getSkillListings(filters?: {
  category?: SkillCategory
  listingType?: 'offered' | 'wanted'
  userId?: string
  isRemote?: boolean
  isInPerson?: boolean
  searchQuery?: string
}): Promise<SkillListing[]> {
  let query = supabase
    .from('skill_listings')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.listingType) {
    query = query.eq('listing_type', filters.listingType)
  }

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (filters?.isRemote !== undefined) {
    query = query.eq('is_remote', filters.isRemote)
  }

  if (filters?.isInPerson !== undefined) {
    query = query.eq('is_in_person', filters.isInPerson)
  }

  if (filters?.searchQuery) {
    // Strip characters that have special meaning in PostgREST filter strings
    // (comma separates OR terms; parentheses are used in grouped expressions)
    // before interpolating into the .or() call to prevent filter injection.
    const safeQuery = filters.searchQuery.replace(/[(),`]/g, '')
    if (safeQuery) {
      query = query.or(
        `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
      )
    }
  }

  const { data, error } = await query

  if (error) {
    throw new SkillsServiceError(error.message, error.code)
  }

  return data.map(mapDbSkillToListing)
}

/**
 * Get a single skill listing by ID
 */
export async function getSkillById(id: string): Promise<SkillListing | null> {
  const { data, error } = await supabase
    .from('skill_listings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new SkillsServiceError(error.message, error.code)
  }

  return mapDbSkillToListing(data)
}

/**
 * Get all skills for a specific user
 */
export async function getSkillsByUser(userId: string): Promise<SkillListing[]> {
  const { data, error } = await supabase
    .from('skill_listings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new SkillsServiceError(error.message, error.code)
  }

  return data.map(mapDbSkillToListing)
}

/**
 * Create a new skill listing
 */
export async function createSkillListing(
  listing: Omit<SkillListing, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SkillListing> {
  const dbInsert = mapListingToDbInsert(listing)

  const { data, error } = await supabase
    .from('skill_listings')
    .insert(dbInsert)
    .select()
    .single()

  if (error) {
    throw new SkillsServiceError(error.message, error.code)
  }

  return mapDbSkillToListing(data)
}

/**
 * Update an existing skill listing
 */
export async function updateSkillListing(
  id: string,
  updates: Partial<SkillListing>
): Promise<SkillListing> {
  const dbUpdates = mapListingToDbUpdate(updates)

  const { data, error } = await supabase
    .from('skill_listings')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new SkillsServiceError(error.message, error.code)
  }

  return mapDbSkillToListing(data)
}

/**
 * Delete a skill listing
 */
export async function deleteSkillListing(id: string): Promise<void> {
  const { error } = await supabase
    .from('skill_listings')
    .delete()
    .eq('id', id)

  if (error) {
    throw new SkillsServiceError(error.message, error.code)
  }
}

/**
 * Get skills by category
 */
export async function getSkillsByCategory(
  category: SkillCategory
): Promise<SkillListing[]> {
  const { data, error } = await supabase
    .from('skill_listings')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    throw new SkillsServiceError(error.message, error.code)
  }

  return data.map(mapDbSkillToListing)
}
