import { useState, useEffect, useRef } from 'react'
import type { User } from '@/types'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { NeighbourhoodTypeahead } from '@/components/ui/NeighbourhoodTypeahead'
import { ensureNeighbourhoodExists } from '@/services/neighbourhoods'


const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

/**
 * Verify an image file's magic bytes to confirm it is actually the declared
 * type.  Relying solely on file.type is unsafe because the MIME type is derived
 * from the file extension and can be trivially spoofed.
 */
async function checkImageMagicBytes(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer)
      // JPEG: FF D8 FF
      if (arr[0] === 0xff && arr[1] === 0xd8 && arr[2] === 0xff) return resolve(true)
      // PNG: 89 50 4E 47
      if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4e && arr[3] === 0x47) return resolve(true)
      // WebP: 52 49 46 46 ?? ?? ?? ?? 57 45 42 50
      if (
        arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 &&
        arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50
      ) return resolve(true)
      resolve(false)
    }
    reader.readAsArrayBuffer(file.slice(0, 12))
  })
}

export interface ProfileFormData {
  fields: Partial<User>
  avatarFile?: File | null
  avatarRemoved?: boolean
}

interface ProfileFormProps {
  user: User
  onSubmit: (data: ProfileFormData) => void
  onCancel: () => void
  submitting?: boolean
}

export function ProfileForm({ user, onSubmit, onCancel, submitting = false }: ProfileFormProps) {
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [bio, setBio] = useState(user.bio)
  const [neighbourhood, setNeighbourhood] = useState(user.neighbourhood)
  const [postcode, setPostcode] = useState(user.postcode ?? '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [neighbourhoodCoords, setNeighbourhoodCoords] = useState<{ latitude?: number; longitude?: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clean up object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setFileError(null)

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFileError('Please select an image file (PNG, JPEG, or WebP).')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('Image must be smaller than 2MB.')
      return
    }

    // Validate actual file content via magic bytes — the MIME type from
    // file.type is derived from the extension and can be spoofed.
    const isValidImage = await checkImageMagicBytes(file)
    if (!isValidImage) {
      setFileError('Please select a valid image file (PNG, JPEG, or WebP).')
      return
    }

    // Revoke old preview URL
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarRemoved(false)

    // Reset the input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleRemoveAvatar() {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
    }
    setAvatarFile(null)
    setAvatarPreview(null)
    setAvatarRemoved(true)
    setFileError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      // Ensure the selected neighbourhood exists in the DB
      await ensureNeighbourhoodExists(
        neighbourhood,
        neighbourhoodCoords.latitude,
        neighbourhoodCoords.longitude,
      )
    } catch {
      // If the upsert fails, proceed anyway — the profile update
      // will fail with a FK error which the caller can handle
    }
    onSubmit({
      fields: {
        firstName,
        lastName,
        bio,
        neighbourhood,
        postcode,
      },
      avatarFile,
      avatarRemoved,
    })
  }

  const fullName = `${firstName} ${lastName}`
  const displayAvatarSrc = avatarRemoved ? null : (avatarPreview ?? user.avatarUrl)
  const hasAvatar = displayAvatarSrc !== null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar picker */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative group">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Change profile photo"
          >
            <Avatar src={displayAvatarSrc} name={fullName} size="xl" />
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <path d="M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5H11a1.25 1.25 0 1 1 0 2.5H2.25A1.25 1.25 0 0 1 1 17V8.25Z" />
                <path d="M11.307 1.936a2.194 2.194 0 0 1 3.101 0l1.656 1.656a2.194 2.194 0 0 1 0 3.101l-7.07 7.07a1.75 1.75 0 0 1-.834.465l-3.125.78a.875.875 0 0 1-1.06-1.06l.78-3.124a1.75 1.75 0 0 1 .464-.835l7.088-7.053Z" />
              </svg>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            aria-hidden="true"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Change photo
          </button>
          {hasAvatar && (
            <>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Remove
              </button>
            </>
          )}
        </div>
        {fileError && (
          <p className="text-red-500 text-sm">{fileError}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          maxLength={100}
        />
        <Input
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          maxLength={100}
        />
      </div>

      <Textarea
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={4}
        maxLength={500}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NeighbourhoodTypeahead
          value={neighbourhood}
          onChange={(place) => {
            setNeighbourhood(place?.name ?? '')
            setNeighbourhoodCoords({
              latitude: place?.latitude,
              longitude: place?.longitude,
            })
          }}
        />
        <Input
          label="Postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          maxLength={10}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
