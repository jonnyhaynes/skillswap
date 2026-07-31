import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { NeighbourhoodTypeahead } from '@/components/ui/NeighbourhoodTypeahead'
import { useAuth } from '@/hooks/useAuth'
import { ensureNeighbourhoodExists } from '@/services/neighbourhoods'
import { useSeo } from '@/hooks/useSeo'

export function OnboardingPage() {
  useSeo({
    title: 'Complete Your Profile',
    description: 'Finish setting up your SkillSwap profile.',
    noindex: true,
  })

  const navigate = useNavigate()
  const { currentUser, updateProfile } = useAuth()
  const [neighbourhood, setNeighbourhood] = useState('')
  const [neighbourhoodCoords, setNeighbourhoodCoords] = useState<{ latitude?: number; longitude?: number }>({})
  const [postcode, setPostcode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!neighbourhood) {
      setError('Please select a neighbourhood from the suggestions')
      return
    }

    setLoading(true)

    try {
      await ensureNeighbourhoodExists(
        neighbourhood,
        neighbourhoodCoords.latitude,
        neighbourhoodCoords.longitude,
      )

      const result = await updateProfile({
        neighbourhood,
        postcode: postcode || '',
      })

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      navigate('/', { replace: true })
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome to SkillSwap!</h1>
          <p className="text-slate-600 mt-2">
            Hi {currentUser?.firstName || 'there'}, tell us where you're based so we can connect you with neighbours.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
                {error}
              </div>
            )}

            <NeighbourhoodTypeahead
              value={neighbourhood}
              onChange={(place) => {
                setNeighbourhood(place?.name ?? '')
                setNeighbourhoodCoords({
                  latitude: place?.latitude,
                  longitude: place?.longitude,
                })
              }}
              required
            />

            <div>
              <label htmlFor="onboarding-postcode" className="block text-sm font-medium text-slate-700 mb-1">
                Postcode <span className="text-slate-500">(optional)</span>
              </label>
              <input
                id="onboarding-postcode"
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="e.g. E8 1AB"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Get started'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
