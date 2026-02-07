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
