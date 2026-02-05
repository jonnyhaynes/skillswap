import { useContext } from 'react'
import { MessagesContext, type MessagesContextType } from '@/context/MessagesContext'

export function useMessages(): MessagesContextType {
  const context = useContext(MessagesContext)
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider')
  }
  return context
}
