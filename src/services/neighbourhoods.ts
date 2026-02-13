import { supabase } from '@/lib/supabase'
import { NEIGHBOURHOODS } from '@/data/neighbourhoods'

/**
 * Fetch all neighbourhoods from the database.
 * Falls back to the static list if the query fails.
 */
export async function getNeighbourhoods(): Promise<string[]> {
  const { data, error } = await supabase
    .from('neighbourhoods')
    .select('name')
    .order('name')

  if (error || !data?.length) {
    return [...NEIGHBOURHOODS]
  }

  return data.map((row) => row.name)
}

/**
 * Ensure a neighbourhood exists in the database.
 * Inserts it if missing; silently succeeds if already present.
 * Call this when a user selects a place from the typeahead,
 * before storing it on their profile.
 */
export async function ensureNeighbourhoodExists(name: string): Promise<void> {
  const trimmed = name.trim()
  if (!trimmed) return

  const { error } = await supabase
    .from('neighbourhoods')
    .upsert({ name: trimmed }, { onConflict: 'name' })

  if (error) {
    console.error('Failed to ensure neighbourhood exists:', error.message)
  }
}
