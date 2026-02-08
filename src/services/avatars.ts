import { supabase } from '@/lib/supabase'

const BUCKET = 'avatars'

/**
 * Upload an avatar image for a user.
 * Stores the file at `avatars/{userId}/avatar.{ext}` and returns the public URL.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/avatar.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true })

  if (error) {
    throw new Error(`Failed to upload avatar: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path)

  // Append cache-busting param so the browser fetches the new image
  return `${urlData.publicUrl}?t=${Date.now()}`
}

/**
 * Delete all avatar files for a user.
 */
export async function deleteAvatar(userId: string): Promise<void> {
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(userId)

  if (listError) {
    throw new Error(`Failed to list avatar files: ${listError.message}`)
  }

  if (files && files.length > 0) {
    const paths = files.map((f) => `${userId}/${f.name}`)
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove(paths)

    if (removeError) {
      throw new Error(`Failed to delete avatar: ${removeError.message}`)
    }
  }
}
