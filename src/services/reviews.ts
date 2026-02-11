// Reviews service - Supabase operations for reviews

import { supabase } from '@/lib/supabase'
import { mapDbReview, mapReviewToDbInsert } from '@/lib/typeMappers'
import type { Review, SkillCategory } from '@/types'

export class ReviewsServiceError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ReviewsServiceError'
    this.code = code
  }
}

/**
 * Get all reviews for a user (where they are the reviewee)
 */
export async function getReviewsForUser(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new ReviewsServiceError(error.message, error.code)
  }

  return data.map(mapDbReview)
}

/**
 * Get reviews written by a user
 */
export async function getReviewsByUser(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewer_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new ReviewsServiceError(error.message, error.code)
  }

  return data.map(mapDbReview)
}

/**
 * Get a review for a specific swap
 */
export async function getReviewForSwap(
  swapId: string,
  reviewerId: string
): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('swap_id', swapId)
    .eq('reviewer_id', reviewerId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new ReviewsServiceError(error.message, error.code)
  }

  return mapDbReview(data)
}

/**
 * Get all reviews for a swap (both parties)
 */
export async function getReviewsForSwap(swapId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('swap_id', swapId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new ReviewsServiceError(error.message, error.code)
  }

  return data.map(mapDbReview)
}

/**
 * Create a new review
 */
export async function createReview(
  review: Omit<Review, 'id' | 'createdAt'>
): Promise<Review> {
  const dbInsert = mapReviewToDbInsert(review)

  const { data, error } = await supabase
    .from('reviews')
    .insert(dbInsert)
    .select()
    .single()

  if (error) {
    console.error('Review creation failed:', { message: error.message, code: error.code, details: error.details, hint: error.hint })
    throw new ReviewsServiceError(error.message, error.code)
  }

  return mapDbReview(data)
}

/**
 * Check if a user can review a swap (swap is completed or cancelled and they haven't reviewed yet)
 */
export async function canUserReviewSwap(
  swapId: string,
  userId: string
): Promise<boolean> {
  // Check if swap is completed/cancelled and user is a participant
  const { data: swap, error: swapError } = await supabase
    .from('swap_proposals')
    .select('status, proposer_id, recipient_id')
    .eq('id', swapId)
    .single()

  if (swapError || !swap) {
    return false
  }

  if (swap.status !== 'completed' && swap.status !== 'cancelled') {
    return false
  }

  if (swap.proposer_id !== userId && swap.recipient_id !== userId) {
    return false
  }

  // Check if they already reviewed
  const existingReview = await getReviewForSwap(swapId, userId)
  return existingReview === null
}

/**
 * Get average rating for a user
 */
export async function getUserAverageRating(
  userId: string
): Promise<{ average: number; count: number }> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', userId)

  if (error) {
    throw new ReviewsServiceError(error.message, error.code)
  }

  if (data.length === 0) {
    return { average: 0, count: 0 }
  }

  const sum = data.reduce((acc, r) => acc + r.rating, 0)
  return {
    average: sum / data.length,
    count: data.length,
  }
}

/**
 * Get reviews by skill category for a user
 */
export async function getReviewsByCategory(
  userId: string,
  category: SkillCategory
): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewee_id', userId)
    .eq('skill_category', category)
    .order('created_at', { ascending: false })

  if (error) {
    throw new ReviewsServiceError(error.message, error.code)
  }

  return data.map(mapDbReview)
}
