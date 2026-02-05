import { useNavigate } from 'react-router'
import { useSkills } from '@/hooks/useSkills'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { SkillForm } from '@/components/skills/SkillForm'
import type { SkillListing } from '@/types'

export function CreateListingPage() {
  const navigate = useNavigate()
  const { addListing } = useSkills()
  const { currentUser } = useAuth()
  const { addToast } = useToast()

  const handleSubmit = (data: Omit<SkillListing, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!currentUser) return
    addListing({ ...data, userId: currentUser.id })
    addToast('Skill listing created!', 'success')
    navigate('/my-listings')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Post a New Skill</h1>
        <p className="text-slate-600 mt-1">Share what you can teach or what you'd like to learn</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <SkillForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
      </div>
    </div>
  )
}
