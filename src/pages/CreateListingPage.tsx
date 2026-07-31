import { useNavigate } from 'react-router'
import { useSkills } from '@/hooks/useSkills'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useSeo } from '@/hooks/useSeo'
import { SkillForm } from '@/components/skills/SkillForm'
import type { SkillListing } from '@/types'

export function CreateListingPage() {
  useSeo({
    title: 'Post a Skill',
    description: 'Create a new skill listing to offer or request a skill in your neighbourhood.',
    noindex: true,
  })

  const navigate = useNavigate()
  const { addListing } = useSkills()
  const { currentUser } = useAuth()
  const { addToast } = useToast()

  const handleSubmit = async (data: Omit<SkillListing, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!currentUser) return
    try {
      const listing = await addListing({ ...data, userId: currentUser.id })
      if (listing) {
        addToast('Skill listing created!', 'success')
        navigate('/my-listings')
      } else {
        addToast('Failed to create listing. Please try again.', 'error')
      }
    } catch (err) {
      console.error('addListing threw unexpectedly:', err)
      addToast('Failed to create listing. Please try again.', 'error')
    }
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
