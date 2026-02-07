import { useState, useEffect } from 'react'
import type { User } from '@/types'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { getNeighbourhoods } from '@/services/neighbourhoods'

interface ProfileFormProps {
  user: User
  onSubmit: (data: Partial<User>) => void
  onCancel: () => void
}

export function ProfileForm({ user, onSubmit, onCancel }: ProfileFormProps) {
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [bio, setBio] = useState(user.bio)
  const [neighbourhood, setNeighbourhood] = useState(user.neighbourhood)
  const [postcode, setPostcode] = useState(user.postcode)
  const [neighbourhoodOptions, setNeighbourhoodOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    getNeighbourhoods().then((names) =>
      setNeighbourhoodOptions(names.map((n) => ({ value: n, label: n })))
    )
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      firstName,
      lastName,
      bio,
      neighbourhood,
      postcode,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

      <Textarea
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={4}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Neighbourhood"
          options={neighbourhoodOptions}
          value={neighbourhood}
          onChange={(e) => setNeighbourhood(e.target.value)}
        />
        <Input
          label="Postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary">
          Save Changes
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
