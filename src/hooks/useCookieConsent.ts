import { useContext } from 'react'
import { CookieConsentContext } from '@/context/CookieConsentContext'

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)

  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider')
  }

  return context
}
