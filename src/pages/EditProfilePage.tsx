import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { ProfileForm, type ProfileFormData } from '@/components/profile/ProfileForm'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { uploadAvatar, deleteAvatar } from '@/services/avatars'
import { useSeo } from '@/hooks/useSeo'

export function EditProfilePage() {
  useSeo({
    title: 'Edit Profile',
    description: 'Update your SkillSwap profile details.',
    noindex: true,
  })

  const { currentUser, updateProfile } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  if (!currentUser) {
    return (
      <EmptyState
        title="Not logged in"
        description="You must be logged in to edit your profile."
      />
    )
  }

  async function handleSubmit({ fields, avatarFile, avatarRemoved }: ProfileFormData) {
    setSubmitting(true)

    try {
      const profileUpdates = { ...fields }

      if (avatarFile) {
        const avatarUrl = await uploadAvatar(currentUser!.id, avatarFile)
        profileUpdates.avatarUrl = avatarUrl
      } else if (avatarRemoved) {
        await deleteAvatar(currentUser!.id)
        profileUpdates.avatarUrl = null
      }

      const result = await updateProfile(profileUpdates)

      if (result.error) {
        addToast(result.error, 'error')
        return
      }

      addToast('Profile updated successfully.', 'success')
      navigate(`/profile/${currentUser!.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      addToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancel() {
    navigate(`/profile/${currentUser!.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
        <Link to="/settings/account" className="text-sm text-gray-500 hover:text-gray-700 underline">
          Account settings
        </Link>
      </div>
      <Card className="p-6">
        <ProfileForm
          user={currentUser}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
        />
      </Card>
    </div>
  )
}
