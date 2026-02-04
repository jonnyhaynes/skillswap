import { createContext, useReducer, useCallback, type ReactNode } from 'react';
import type { SkillListing } from '@/types';
import { skills as mockSkills } from '@/data/skills';
import { generateId } from '@/utils/generateId';

interface SkillsState {
  listings: SkillListing[];
}

type SkillsAction =
  | { type: 'ADD_LISTING'; listing: SkillListing }
  | { type: 'UPDATE_LISTING'; id: string; data: Partial<SkillListing> }
  | { type: 'DELETE_LISTING'; id: string };

export interface SkillsContextType {
  listings: SkillListing[];
  addListing: (data: Omit<SkillListing, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateListing: (id: string, data: Partial<SkillListing>) => void;
  deleteListing: (id: string) => void;
  getListingById: (id: string) => SkillListing | undefined;
  getListingsByUser: (userId: string) => SkillListing[];
}

export const SkillsContext = createContext<SkillsContextType | null>(null);

function skillsReducer(state: SkillsState, action: SkillsAction): SkillsState {
  switch (action.type) {
    case 'ADD_LISTING':
      return { ...state, listings: [action.listing, ...state.listings] };
    case 'UPDATE_LISTING':
      return {
        ...state,
        listings: state.listings.map((listing) =>
          listing.id === action.id
            ? { ...listing, ...action.data, updatedAt: new Date().toISOString() }
            : listing
        ),
      };
    case 'DELETE_LISTING':
      return {
        ...state,
        listings: state.listings.filter((listing) => listing.id !== action.id),
      };
    default:
      return state;
  }
}

export function SkillsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(skillsReducer, {
    listings: [...mockSkills],
  });

  const addListing = useCallback(
    (data: Omit<SkillListing, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const listing: SkillListing = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_LISTING', listing });
    },
    []
  );

  const updateListing = useCallback(
    (id: string, data: Partial<SkillListing>) => {
      dispatch({ type: 'UPDATE_LISTING', id, data });
    },
    []
  );

  const deleteListing = useCallback((id: string) => {
    dispatch({ type: 'DELETE_LISTING', id });
  }, []);

  const getListingById = useCallback(
    (id: string) => state.listings.find((listing) => listing.id === id),
    [state.listings]
  );

  const getListingsByUser = useCallback(
    (userId: string) => state.listings.filter((listing) => listing.userId === userId),
    [state.listings]
  );

  return (
    <SkillsContext.Provider
      value={{
        listings: state.listings,
        addListing,
        updateListing,
        deleteListing,
        getListingById,
        getListingsByUser,
      }}
    >
      {children}
    </SkillsContext.Provider>
  );
}
