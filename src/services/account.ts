import { supabase } from '../lib/supabase'

export interface AccountExport {
  exported_at: string
  profile: Record<string, unknown>
  skill_listings: Record<string, unknown>[]
  conversations: Record<string, unknown>[]
  messages: Record<string, unknown>[]
  swap_proposals: Record<string, unknown>[]
  reviews_written: Record<string, unknown>[]
  reviews_received: Record<string, unknown>[]
}

export class AccountServiceError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'AccountServiceError'
    this.code = code
  }
}

export async function exportAccountData(): Promise<AccountExport> {
  const { data, error } = await supabase.functions.invoke('delete-account', {
    body: { action: 'export' },
  })

  if (error) {
    throw new AccountServiceError(error.message ?? 'Failed to export account data')
  }

  return data as AccountExport
}

export async function deleteAccount(confirmation: string): Promise<void> {
  if (confirmation !== 'DELETE') {
    throw new AccountServiceError('Confirmation must be the string DELETE')
  }

  const { error } = await supabase.functions.invoke('delete-account', {
    body: { action: 'delete', confirmation },
  })

  if (error) {
    throw new AccountServiceError(error.message ?? 'Failed to delete account')
  }
}
