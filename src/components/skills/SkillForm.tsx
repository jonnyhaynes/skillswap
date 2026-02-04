import { useState } from 'react';
import type { SkillListing, SkillCategory, SkillLevel, ListingType } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface SkillFormProps {
  initialData?: SkillListing;
  onSubmit: (data: Omit<SkillListing, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  onCancel: () => void;
}

const LEVEL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({
  value: c.id,
  label: `${c.emoji} ${c.label}`,
}));

export function SkillForm({ initialData, onSubmit, onCancel }: SkillFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [category, setCategory] = useState<SkillCategory>(initialData?.category ?? 'technology');
  const [level, setLevel] = useState<SkillLevel>(initialData?.level ?? 'beginner');
  const [listingType, setListingType] = useState<ListingType>(initialData?.listingType ?? 'offered');
  const [availability, setAvailability] = useState(initialData?.availability ?? '');
  const [isInPerson, setIsInPerson] = useState(initialData?.isInPerson ?? true);
  const [isRemote, setIsRemote] = useState(initialData?.isRemote ?? false);
  const [tagsInput, setTagsInput] = useState(initialData?.tags.join(', ') ?? '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!isInPerson && !isRemote) {
      newErrors.location = 'At least one location option is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      level,
      listingType,
      availability: availability.trim(),
      isInPerson,
      isRemote,
      tags,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Intro to Web Development"
        error={errors.title}
        required
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe what you're offering or looking for..."
        error={errors.description}
        rows={5}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Category"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => setCategory(e.target.value as SkillCategory)}
        />

        <Select
          label="Level"
          options={LEVEL_OPTIONS}
          value={level}
          onChange={(e) => setLevel(e.target.value as SkillLevel)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Listing Type
        </label>
        <div className="flex gap-4">
          <label
            className={cn(
              'flex-1 relative flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors',
              listingType === 'offered'
                ? 'border-primary-500 bg-primary-50'
                : 'border-slate-200 hover:bg-slate-50'
            )}
          >
            <input
              type="radio"
              name="listingType"
              value="offered"
              checked={listingType === 'offered'}
              onChange={() => setListingType('offered')}
              className="text-primary-500 focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-900">
                I'm offering this skill
              </span>
            </div>
          </label>
          <label
            className={cn(
              'flex-1 relative flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors',
              listingType === 'wanted'
                ? 'border-primary-500 bg-primary-50'
                : 'border-slate-200 hover:bg-slate-50'
            )}
          >
            <input
              type="radio"
              name="listingType"
              value="wanted"
              checked={listingType === 'wanted'}
              onChange={() => setListingType('wanted')}
              className="text-primary-500 focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-900">
                I'm looking for this skill
              </span>
            </div>
          </label>
        </div>
      </div>

      <Input
        label="Availability"
        value={availability}
        onChange={(e) => setAvailability(e.target.value)}
        placeholder="e.g. Weekday evenings, Saturday mornings"
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Location Options
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isInPerson}
              onChange={(e) => setIsInPerson(e.target.checked)}
              className="rounded border-slate-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-slate-700">Available in person</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              className="rounded border-slate-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-slate-700">Available remotely</span>
          </label>
        </div>
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location}</p>
        )}
      </div>

      <Input
        label="Tags"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        placeholder="e.g. web, coding, javascript"
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Save Changes' : 'Post Listing'}
        </Button>
      </div>
    </form>
  );
}
