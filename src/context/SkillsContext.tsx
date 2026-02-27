import {
  createContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { SkillListing, SkillCategory } from '@/types'
import {
  getSkillListings,
  getSkillById as getSkillByIdService,
  getSkillsByUser as getSkillsByUserService,
  createSkillListing as createSkillListingService,
  updateSkillListing as updateSkillListingService,
  deleteSkillListing as deleteSkillListingService,
} from '@/services/skills'

interface SkillsState {
  listings: SkillListing[]
  loading: boolean
  error: string | null
  initialized: boolean
}

type SkillsAction =
  | { type: 'SET_LISTINGS'; listings: SkillListing[] }
  | { type: 'ADD_LISTING'; listing: SkillListing }
  | { type: 'UPDATE_LISTING'; id: string; data: Partial<SkillListing> }
  | { type: 'DELETE_LISTING'; id: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_INITIALIZED' }

export interface SkillsContextType {
  listings: SkillListing[]
  loading: boolean
  error: string | null
  initialized: boolean
  fetchListings: (filters?: {
    category?: SkillCategory
    listingType?: 'offered' | 'wanted'
    userId?: string
    searchQuery?: string
  }) => Promise<void>
  addListing: (
    data: Omit<SkillListing, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<SkillListing | null>
  updateListing: (
    id: string,
    data: Partial<SkillListing>
  ) => Promise<SkillListing | null>
  deleteListing: (id: string) => Promise<boolean>
  getListingById: (id: string) => SkillListing | undefined
  fetchListingById: (id: string) => Promise<SkillListing | null>
  getListingsByUser: (userId: string) => SkillListing[]
  fetchListingsByUser: (userId: string) => Promise<SkillListing[]>
  clearError: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const SkillsContext = createContext<SkillsContextType | null>(null)

function skillsReducer(state: SkillsState, action: SkillsAction): SkillsState {
  switch (action.type) {
    case 'SET_LISTINGS':
      return {
        ...state,
        listings: action.listings,
        loading: false,
        error: null,
      }
    case 'ADD_LISTING':
      return {
        ...state,
        listings: [action.listing, ...state.listings],
        loading: false,
      }
    case 'UPDATE_LISTING':
      return {
        ...state,
        listings: state.listings.map((listing) =>
          listing.id === action.id
            ? { ...listing, ...action.data }
            : listing
        ),
        loading: false,
      }
    case 'DELETE_LISTING':
      return {
        ...state,
        listings: state.listings.filter((listing) => listing.id !== action.id),
        loading: false,
      }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false }
    case 'SET_INITIALIZED':
      return { ...state, initialized: true }
    default:
      return state
  }
}

export function SkillsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(skillsReducer, {
    listings: [],
    loading: false,
    error: null,
    initialized: false,
  })

  // Fetch all listings on mount
  useEffect(() => {
    const loadListings = async () => {
      dispatch({ type: 'SET_LOADING', loading: true })
      try {
        const listings = await getSkillListings()
        dispatch({ type: 'SET_LISTINGS', listings })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load listings'
        dispatch({ type: 'SET_ERROR', error: message })
      } finally {
        dispatch({ type: 'SET_INITIALIZED' })
      }
    }

    loadListings()
  }, [])

  const fetchListings = useCallback(
    async (filters?: {
      category?: SkillCategory
      listingType?: 'offered' | 'wanted'
      userId?: string
      searchQuery?: string
    }) => {
      dispatch({ type: 'SET_LOADING', loading: true })
      try {
        const listings = await getSkillListings(filters)
        dispatch({ type: 'SET_LISTINGS', listings })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load listings'
        dispatch({ type: 'SET_ERROR', error: message })
      }
    },
    []
  )

  const addListing = useCallback(
    async (
      data: Omit<SkillListing, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<SkillListing | null> => {
      dispatch({ type: 'SET_LOADING', loading: true })
      dispatch({ type: 'SET_ERROR', error: null })
      try {
        const listing = await createSkillListingService(data)
        dispatch({ type: 'ADD_LISTING', listing })
        return listing
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create listing'
        dispatch({ type: 'SET_ERROR', error: message })
        return null
      }
    },
    []
  )

  const updateListing = useCallback(
    async (
      id: string,
      data: Partial<SkillListing>
    ): Promise<SkillListing | null> => {
      dispatch({ type: 'SET_LOADING', loading: true })
      dispatch({ type: 'SET_ERROR', error: null })
      try {
        const updated = await updateSkillListingService(id, data)
        dispatch({ type: 'UPDATE_LISTING', id, data: updated })
        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update listing'
        dispatch({ type: 'SET_ERROR', error: message })
        return null
      }
    },
    []
  )

  const deleteListing = useCallback(async (id: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', loading: true })
    dispatch({ type: 'SET_ERROR', error: null })
    try {
      await deleteSkillListingService(id)
      dispatch({ type: 'DELETE_LISTING', id })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete listing'
      dispatch({ type: 'SET_ERROR', error: message })
      return false
    }
  }, [])

  const getListingById = useCallback(
    (id: string) => state.listings.find((listing) => listing.id === id),
    [state.listings]
  )

  const fetchListingById = useCallback(
    async (id: string): Promise<SkillListing | null> => {
      // Check cache first
      const cached = state.listings.find((l) => l.id === id)
      if (cached) return cached

      try {
        return await getSkillByIdService(id)
      } catch (err) {
        console.error('fetchListingById failed:', { code: (err as { code?: string }).code })
        return null
      }
    },
    [state.listings]
  )

  const getListingsByUser = useCallback(
    (userId: string) =>
      state.listings.filter((listing) => listing.userId === userId),
    [state.listings]
  )

  const fetchListingsByUser = useCallback(
    async (userId: string): Promise<SkillListing[]> => {
      try {
        return await getSkillsByUserService(userId)
      } catch (err) {
        console.error('fetchListingsByUser failed:', { code: (err as { code?: string }).code })
        return []
      }
    },
    []
  )

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', error: null })
  }, [])

  return (
    <SkillsContext.Provider
      value={{
        listings: state.listings,
        loading: state.loading,
        error: state.error,
        initialized: state.initialized,
        fetchListings,
        addListing,
        updateListing,
        deleteListing,
        getListingById,
        fetchListingById,
        getListingsByUser,
        fetchListingsByUser,
        clearError,
      }}
    >
      {children}
    </SkillsContext.Provider>
  )
}
