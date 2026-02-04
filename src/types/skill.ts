export type SkillCategory =
  | 'technology'
  | 'music'
  | 'languages'
  | 'cooking'
  | 'fitness'
  | 'arts-crafts'
  | 'gardening'
  | 'diy-repairs'
  | 'tutoring'
  | 'photography'
  | 'business'
  | 'other';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type ListingType = 'offered' | 'wanted';

export interface SkillListing {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: SkillCategory;
  level: SkillLevel;
  listingType: ListingType;
  availability: string;
  isRemote: boolean;
  isInPerson: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}
