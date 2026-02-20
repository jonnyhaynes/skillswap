import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { initGA4 } from '@/lib/analytics'
import { initBugsnag } from '@/lib/bugsnag'

const STORAGE_KEY = 'skillswap_cookie_consent'

type ConsentStatus = 'accepted' | 'declined' | null

interface ConsentRecord {
  status: 'accepted' | 'declined'
  timestamp: string
}

interface CookieConsentContextType {
  consentStatus: ConsentStatus
  accept: () => void
  decline: () => void
}

function readStoredConsent(): ConsentStatus {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null) return null
    const parsed: ConsentRecord = JSON.parse(stored)
    return parsed.status === 'accepted' ? 'accepted' : 'declined'
  } catch {
    return null
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  // Read from localStorage synchronously on mount so returning visitors never see the banner
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>(readStoredConsent)

  // When consent is accepted, initialise GA4 and Bugsnag.
  useEffect(() => {
    if (consentStatus === 'accepted') {
      initGA4()
      initBugsnag()
    }
  }, [consentStatus])

  const accept = useCallback(() => {
    const record: ConsentRecord = {
      status: 'accepted',
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
    setConsentStatus('accepted')
  }, [])

  const decline = useCallback(() => {
    const record: ConsentRecord = {
      status: 'declined',
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
    setConsentStatus('declined')
  }, [])

  return (
    <CookieConsentContext.Provider value={{ consentStatus, accept, decline }}>
      {children}
    </CookieConsentContext.Provider>
  )
}
