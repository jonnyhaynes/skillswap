import type { Review } from '../types';

export const reviews: Review[] = [
  // swap-1 reviews: Alex <-> Maria (web dev for guitar)
  {
    id: 'review-1',
    swapId: 'swap-1',
    reviewerId: 'user-1',
    revieweeId: 'user-2',
    rating: 5,
    comment:
      'Maria is an incredible guitar teacher. She broke down flamenco techniques into manageable steps and was so patient with my clumsy fingers. I can now play three full songs confidently. Highly recommend!',
    createdAt: '2026-01-21T10:00:00Z',
    skillCategory: 'music',
  },
  {
    id: 'review-2',
    swapId: 'swap-1',
    reviewerId: 'user-2',
    revieweeId: 'user-1',
    rating: 5,
    comment:
      'Alex made web development feel approachable and fun. He explained everything clearly and helped me build a portfolio site I am genuinely proud of. Could not have asked for a better swap partner.',
    createdAt: '2026-01-21T11:30:00Z',
    skillCategory: 'technology',
  },

  // swap-6 reviews: David <-> Sarah (photography for gardening)
  {
    id: 'review-3',
    swapId: 'swap-6',
    reviewerId: 'user-7',
    revieweeId: 'user-8',
    rating: 5,
    comment:
      'Sarah is a gardening encyclopaedia! She helped me plan my entire garden from scratch, from building raised beds to choosing the right crops for the season. My garden has gone from a wasteland to something I am actually proud of.',
    createdAt: '2026-01-23T09:00:00Z',
    skillCategory: 'gardening',
  },
  {
    id: 'review-4',
    swapId: 'swap-6',
    reviewerId: 'user-8',
    revieweeId: 'user-7',
    rating: 4,
    comment:
      'David is a brilliant photographer and a patient teacher. My allotment photos have gone from blurry phone snaps to images our community group actually uses in their newsletter. Only giving 4 stars because I wanted more sessions!',
    createdAt: '2026-01-23T14:00:00Z',
    skillCategory: 'photography',
  },
];
