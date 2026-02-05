import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSkills } from '@/hooks/useSkills';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface SwapProposalFormProps {
  recipientId: string;
  onSubmit: (data: { offeredSkillId: string; requestedSkillId: string; message: string }) => void;
  onCancel: () => void;
}

export function SwapProposalForm({ recipientId, onSubmit, onCancel }: SwapProposalFormProps) {
  const { currentUser } = useAuth();
  const { getListingsByUser } = useSkills();

  const myListings = currentUser
    ? getListingsByUser(currentUser.id).filter((l) => l.listingType === 'offered')
    : [];
  const recipientListings = getListingsByUser(recipientId).filter(
    (l) => l.listingType === 'offered'
  );

  const [offeredSkillId, setOfferedSkillId] = useState(myListings[0]?.id ?? '');
  const [requestedSkillId, setRequestedSkillId] = useState(recipientListings[0]?.id ?? '');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offeredSkillId || !requestedSkillId || !message.trim()) return;
    onSubmit({ offeredSkillId, requestedSkillId, message: message.trim() });
  };

  const myOptions = [
    { value: '', label: 'Select a skill...' },
    ...myListings.map((l) => ({ value: l.id, label: l.title })),
  ];

  const recipientOptions = [
    { value: '', label: 'Select a skill...' },
    ...recipientListings.map((l) => ({ value: l.id, label: l.title })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Your skill to offer"
        options={myOptions}
        value={offeredSkillId}
        onChange={(e) => setOfferedSkillId(e.target.value)}
      />

      <Select
        label="Skill you want in return"
        options={recipientOptions}
        value={requestedSkillId}
        onChange={(e) => setRequestedSkillId(e.target.value)}
      />

      <Textarea
        label="Message"
        placeholder="Introduce yourself and explain why you'd like to swap skills..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!offeredSkillId || !requestedSkillId || !message.trim()}
        >
          Send Proposal
        </Button>
      </div>
    </form>
  );
}
