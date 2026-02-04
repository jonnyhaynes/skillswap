import type { SkillCategory } from './skill';

export interface Review {
  id: string;
  swapId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
  skillCategory: SkillCategory;
}
