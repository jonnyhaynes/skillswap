// Error handling utilities for Supabase operations

import type { AuthError, PostgrestError } from '@supabase/supabase-js'
import Bugsnag from '@bugsnag/js'

/**
 * Base application error class
 */
export class AppError extends Error {
  code?: string
  statusCode?: number

  constructor(message: string, code?: string, statusCode?: number) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
  }
}

/**
 * Convert Supabase PostgrestError to a user-friendly message
 */
export function getPostgrestErrorMessage(error: PostgrestError): string {
  // Handle common error codes
  switch (error.code) {
    case 'PGRST116':
      return 'The requested item was not found.'
    case '23505':
      return 'This item already exists.'
    case '23503':
      return 'Cannot complete this action due to related data.'
    case '42501':
      return 'You do not have permission to perform this action.'
    case '22P02':
      return 'Invalid data format provided.'
    default:
      // Log only safe fields — omit `details` and `hint` which may contain
      // schema information or problematic values visible in browser dev tools.
      console.error('Database error:', { code: error.code, message: error.message })
      if (Bugsnag.isStarted()) {
        Bugsnag.notify(new Error(error.message), (event) => {
          event.addMetadata('supabase', { code: error.code, details: error.details, hint: error.hint })
        })
      }
      return error.message || 'An unexpected database error occurred.'
  }
}

/**
 * Convert Supabase AuthError to a user-friendly message
 */
export function getAuthErrorMessage(error: AuthError): string {
  // Handle common auth error messages
  const message = error.message.toLowerCase()

  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password. Please try again.'
  }

  if (message.includes('email not confirmed')) {
    return 'Please check your email and confirm your account before signing in.'
  }

  if (message.includes('user already registered')) {
    return 'An account with this email already exists.'
  }

  if (message.includes('password')) {
    return 'Password must be at least 6 characters long.'
  }

  if (message.includes('invalid') && message.includes('email')) {
    return 'Please enter a valid email address.'
  }

  if (message.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }

  if (message.includes('provider is not enabled')) {
    return 'This sign-in method is not currently available. Please try another method.'
  }

  if (message.includes('oauth')) {
    return 'There was a problem signing in with your account. Please try again.'
  }

  // Return the original message if no specific handling
  return error.message
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout')
    )
  }
  return false
}

/**
 * Format any error to a user-friendly message
 */
export function formatErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Network error. Please check your internet connection and try again.'
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred. Please try again.'
}
