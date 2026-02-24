import {
  createContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { User as AppUser } from '@/types'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getProfile, updateProfile as updateProfileService, getProfilesByIds } from '@/services/profiles'
import { getAuthErrorMessage } from '@/lib/errors'
import { usePresence } from '@/hooks/usePresence'

interface AuthState {
  currentUser: AppUser | null
  session: Session | null
  loading: boolean
  initialized: boolean
  error: string | null
  needsOnboarding: boolean
  // Cache for fetched user profiles
  usersCache: Map<string, AppUser>
}

type AuthAction =
  | { type: 'SET_SESSION'; session: Session | null; user: AppUser | null }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_INITIALIZED' }
  | { type: 'UPDATE_PROFILE'; data: Partial<AppUser> }
  | { type: 'CACHE_USERS'; users: AppUser[] }
  | { type: 'SET_NEEDS_ONBOARDING'; needsOnboarding: boolean }
  | { type: 'LOGOUT' }

export interface AuthContextType {
  currentUser: AppUser | null
  session: Session | null
  loading: boolean
  initialized: boolean
  error: string | null
  signUp: (
    email: string,
    password: string,
    metadata: { firstName: string; lastName: string; neighbourhood?: string; postcode?: string },
    captchaToken?: string
  ) => Promise<{ error?: string }>
  signIn: (email: string, password: string, captchaToken?: string) => Promise<{ error?: string }>
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string, captchaToken?: string) => Promise<{ error?: string }>
  updateProfile: (data: Partial<AppUser>) => Promise<{ error?: string }>
  updateEmail: (currentPassword: string, newEmail: string) => Promise<{ error?: string }>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: string }>
  getUserById: (userId: string) => AppUser | undefined
  fetchUserById: (userId: string) => Promise<AppUser | null>
  fetchUsersByIds: (userIds: string[]) => Promise<AppUser[]>
  clearError: () => void
  needsOnboarding: boolean
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null)

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_SESSION':
      return {
        ...state,
        session: action.session,
        currentUser: action.user,
        loading: false,
        error: null,
      }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false }
    case 'SET_INITIALIZED':
      return { ...state, initialized: true }
    case 'UPDATE_PROFILE': {
      if (!state.currentUser) return state
      const updatedUser = { ...state.currentUser, ...action.data }
      const newCache = new Map(state.usersCache)
      newCache.set(updatedUser.id, updatedUser)
      return {
        ...state,
        currentUser: updatedUser,
        usersCache: newCache,
      }
    }
    case 'CACHE_USERS': {
      const cache = new Map(state.usersCache)
      action.users.forEach((user) => cache.set(user.id, user))
      return { ...state, usersCache: cache }
    }
    case 'SET_NEEDS_ONBOARDING':
      return { ...state, needsOnboarding: action.needsOnboarding }
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        session: null,
        error: null,
      }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    currentUser: null,
    session: null,
    loading: true,
    initialized: false,
    error: null,
    needsOnboarding: false,
    usersCache: new Map(),
  })

  usePresence(state.currentUser?.id ?? null)

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await getProfile(session.user.id)
        dispatch({ type: 'SET_SESSION', session, user: profile })
        // Check if user needs to complete onboarding
        if (profile && profile.neighbourhood === 'Unknown') {
          dispatch({ type: 'SET_NEEDS_ONBOARDING', needsOnboarding: true })
        }
      } else {
        dispatch({ type: 'SET_SESSION', session: null, user: null })
      }
      dispatch({ type: 'SET_INITIALIZED' })
    })

    // Listen for auth changes
    // IMPORTANT: The callback must NOT be async to avoid deadlocks with
    // Supabase's internal navigator lock. Async work is deferred with .then().
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        getProfile(session.user.id).then((profile) => {
          dispatch({ type: 'SET_SESSION', session, user: profile })
          // Check if OAuth user needs to complete onboarding
          if (profile && profile.neighbourhood === 'Unknown') {
            dispatch({ type: 'SET_NEEDS_ONBOARDING', needsOnboarding: true })
          }
        })
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' })
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Keep the session updated but don't refetch profile
        dispatch({
          type: 'SET_SESSION',
          session,
          user: state.currentUser,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
    // Note: state.currentUser is intentionally omitted to prevent infinite loops
    // The TOKEN_REFRESHED case uses the existing state.currentUser which is fine
    // since we're just maintaining the same user during token refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata: { firstName: string; lastName: string; neighbourhood?: string; postcode?: string },
      captchaToken?: string
    ): Promise<{ error?: string }> => {
      dispatch({ type: 'SET_LOADING', loading: true })
      dispatch({ type: 'SET_ERROR', error: null })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken,
          data: {
            first_name: metadata.firstName,
            last_name: metadata.lastName,
            neighbourhood: metadata.neighbourhood,
            postcode: metadata.postcode,
          },
        },
      })

      if (error) {
        const errorMessage = getAuthErrorMessage(error)
        dispatch({ type: 'SET_ERROR', error: errorMessage })
        return { error: errorMessage }
      }

      // If email confirmation is required, the user won't be logged in yet
      if (data.user && !data.session) {
        dispatch({ type: 'SET_LOADING', loading: false })
        return {} // Success - email confirmation required
      }

      return {}
    },
    []
  )

  const signIn = useCallback(
    async (email: string, password: string, captchaToken?: string): Promise<{ error?: string }> => {
      dispatch({ type: 'SET_LOADING', loading: true })
      dispatch({ type: 'SET_ERROR', error: null })

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken },
      })

      if (error) {
        const errorMessage = getAuthErrorMessage(error)
        dispatch({ type: 'SET_ERROR', error: errorMessage })
        return { error: errorMessage }
      }

      return {}
    },
    []
  )

  const signInWithOAuth = useCallback(
    async (provider: 'google' | 'apple'): Promise<{ error?: string }> => {
      dispatch({ type: 'SET_LOADING', loading: true })
      dispatch({ type: 'SET_ERROR', error: null })

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        const errorMessage = getAuthErrorMessage(error)
        dispatch({ type: 'SET_ERROR', error: errorMessage })
        return { error: errorMessage }
      }

      // Browser will redirect — no need to dispatch further
      return {}
    },
    []
  )

  const signOut = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', loading: true })
    await supabase.auth.signOut()
    dispatch({ type: 'LOGOUT' })
    dispatch({ type: 'SET_LOADING', loading: false })
  }, [])

  const resetPassword = useCallback(
    async (email: string, captchaToken?: string): Promise<{ error?: string }> => {
      dispatch({ type: 'SET_LOADING', loading: true })

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
        captchaToken,
      })

      dispatch({ type: 'SET_LOADING', loading: false })

      if (error) {
        const errorMessage = getAuthErrorMessage(error)
        return { error: errorMessage }
      }

      return {}
    },
    []
  )

  const updateProfile = useCallback(
    async (data: Partial<AppUser>): Promise<{ error?: string }> => {
      if (!state.currentUser) {
        return { error: 'Not authenticated' }
      }

      dispatch({ type: 'SET_LOADING', loading: true })

      try {
        const updated = await updateProfileService(state.currentUser.id, data)
        dispatch({ type: 'UPDATE_PROFILE', data: updated })
        // Clear onboarding flag if neighbourhood was updated
        if (updated.neighbourhood && updated.neighbourhood !== 'Unknown') {
          dispatch({ type: 'SET_NEEDS_ONBOARDING', needsOnboarding: false })
        }
        dispatch({ type: 'SET_LOADING', loading: false })
        return {}
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
        dispatch({ type: 'SET_ERROR', error: errorMessage })
        return { error: errorMessage }
      }
    },
    [state.currentUser]
  )

  const updateEmail = useCallback(
    async (currentPassword: string, newEmail: string): Promise<{ error?: string }> => {
      if (!state.currentUser || !state.session?.user.email) {
        return { error: 'Not authenticated' }
      }

      // Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: state.session.user.email,
        password: currentPassword,
      })

      if (signInError) {
        return { error: 'Incorrect password. Please try again.' }
      }

      // Request email change — Supabase sends confirmation link to new email
      const { error: updateError } = await supabase.auth.updateUser({ email: newEmail })

      if (updateError) {
        return { error: getAuthErrorMessage(updateError) }
      }

      return {}
    },
    [state.currentUser, state.session]
  )

  const getUserById = useCallback(
    (userId: string): AppUser | undefined => {
      if (state.currentUser?.id === userId) {
        return state.currentUser
      }
      return state.usersCache.get(userId)
    },
    [state.currentUser, state.usersCache]
  )

  const fetchUserById = useCallback(
    async (userId: string): Promise<AppUser | null> => {
      // Check cache first
      const cached = state.usersCache.get(userId)
      if (cached) return cached

      // Check if it's the current user
      if (state.currentUser?.id === userId) {
        return state.currentUser
      }

      // Fetch from database
      const profile = await getProfile(userId)
      if (profile) {
        dispatch({ type: 'CACHE_USERS', users: [profile] })
      }
      return profile
    },
    [state.currentUser, state.usersCache]
  )

  const fetchUsersByIds = useCallback(
    async (userIds: string[]): Promise<AppUser[]> => {
      // Filter out already cached users
      const uncachedIds = userIds.filter(
        (id) => !state.usersCache.has(id) && id !== state.currentUser?.id
      )

      // Get cached users
      const cachedUsers: AppUser[] = []
      userIds.forEach((id) => {
        if (state.currentUser?.id === id) {
          cachedUsers.push(state.currentUser)
        } else if (state.usersCache.has(id)) {
          cachedUsers.push(state.usersCache.get(id)!)
        }
      })

      // Fetch uncached users
      if (uncachedIds.length > 0) {
        const fetchedUsers = await getProfilesByIds(uncachedIds)
        dispatch({ type: 'CACHE_USERS', users: fetchedUsers })
        return [...cachedUsers, ...fetchedUsers]
      }

      return cachedUsers
    },
    [state.currentUser, state.usersCache]
  )

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', error: null })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        currentUser: state.currentUser,
        session: state.session,
        loading: state.loading,
        initialized: state.initialized,
        error: state.error,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        resetPassword,
        updateProfile,
        updateEmail,
        getUserById,
        fetchUserById,
        fetchUsersByIds,
        clearError,
        needsOnboarding: state.needsOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
