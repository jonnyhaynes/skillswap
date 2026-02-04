import { createContext, useReducer, type ReactNode } from 'react'
import type { User } from '@/types'
import { users as mockUsers } from '@/data/users'

interface AuthState {
  currentUser: User | null;
  allUsers: User[];
}

type AuthAction =
  | { type: 'SWITCH_USER'; userId: string }
  | { type: 'UPDATE_PROFILE'; data: Partial<User> }
  | { type: 'LOGOUT' }

export interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  switchUser: (userId: string) => void;
  updateProfile: (data: Partial<User>) => void;
  getUserById: (userId: string) => User | undefined;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null)

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SWITCH_USER': {
      const user = state.allUsers.find((u) => u.id === action.userId)
      return { ...state, currentUser: user ?? null }
    }
    case 'UPDATE_PROFILE': {
      if (!state.currentUser) return state
      const updatedUser = { ...state.currentUser, ...action.data }
      return {
        ...state,
        currentUser: updatedUser,
        allUsers: state.allUsers.map((u) =>
          u.id === updatedUser.id ? updatedUser : u
        ),
      }
    }
    case 'LOGOUT':
      return { ...state, currentUser: null }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    currentUser: mockUsers[0],
    allUsers: [...mockUsers],
  })

  const switchUser = (userId: string) =>
    dispatch({ type: 'SWITCH_USER', userId })

  const updateProfile = (data: Partial<User>) =>
    dispatch({ type: 'UPDATE_PROFILE', data })

  const getUserById = (userId: string) =>
    state.allUsers.find((u) => u.id === userId)

  const logout = () => dispatch({ type: 'LOGOUT' })

  return (
    <AuthContext.Provider
      value={{
        currentUser: state.currentUser,
        allUsers: state.allUsers,
        switchUser,
        updateProfile,
        getUserById,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
