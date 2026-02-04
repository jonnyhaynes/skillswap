import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { User } from '@/types'

export function EditProfilePage() {
  const { currentUser, updateProfile } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  if (!currentUser) {
    return (
      <EmptyState
        title="Not logged in"
        description="You must be logged in to edit your profile."
      />
    )
  }

  function handleSubmit(data: Partial<User>) {
    updateProfile(data)
    addToast('Profile updated successfully.', 'success')
    navigate(`/profile/${currentUser!.id}`)
  }

  function handleCancel() {
    navigate(`/profile/${currentUser!.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Profile</h1>
      <Card className="p-6">
        <ProfileForm
          user={currentUser}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  )
}
