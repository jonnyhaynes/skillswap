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

  // swap-7 reviews: James <-> Alex (cooking for web dev)
  {
    id: 'review-5',
    swapId: 'swap-7',
    reviewerId: 'user-1',
    revieweeId: 'user-3',
    rating: 4,
    comment:
      'James is an amazing cook and a great teacher. The pasta-making session was a highlight. His restaurant kitchen is a brilliant setup for learning.',
    createdAt: '2026-01-16T10:00:00Z',
    skillCategory: 'cooking',
  },
  {
    id: 'review-6',
    swapId: 'swap-7',
    reviewerId: 'user-3',
    revieweeId: 'user-1',
    rating: 5,
    comment:
      'Alex built me a fantastic restaurant website from scratch. He explained everything clearly and even showed me how to update the menu myself. Top-notch swap partner.',
    createdAt: '2026-01-16T11:00:00Z',
    skillCategory: 'technology',
  },

  // swap-8 reviews: Alex <-> Tom (web dev for carpentry)
  {
    id: 'review-7',
    swapId: 'swap-8',
    reviewerId: 'user-1',
    revieweeId: 'user-5',
    rating: 5,
    comment:
      'Tom is a master craftsman. He fixed my bookshelf, taught me how to use a hand plane, and even helped me refinish an old side table. His workshop is incredible.',
    createdAt: '2026-01-19T09:00:00Z',
    skillCategory: 'diy-repairs',
  },
  {
    id: 'review-8',
    swapId: 'swap-8',
    reviewerId: 'user-5',
    revieweeId: 'user-1',
    rating: 5,
    comment:
      'Alex helped me build a proper website for my carpentry business with a gallery and contact form. He was patient and made it easy to understand. Already getting enquiries through it!',
    createdAt: '2026-01-19T10:00:00Z',
    skillCategory: 'technology',
  },

  // swap-9 reviews: Lena <-> Alex (German for React mentoring)
  {
    id: 'review-9',
    swapId: 'swap-9',
    reviewerId: 'user-1',
    revieweeId: 'user-6',
    rating: 4,
    comment:
      'Lena is a patient and encouraging German teacher. Her conversational approach works really well and I can already handle basic conversations. Would have loved a few more sessions.',
    createdAt: '2026-01-21T09:00:00Z',
    skillCategory: 'languages',
  },
  {
    id: 'review-10',
    swapId: 'swap-9',
    reviewerId: 'user-6',
    revieweeId: 'user-1',
    rating: 5,
    comment:
      'Alex is an excellent React mentor. He helped me understand component architecture and state management for my language app. The code reviews were especially valuable.',
    createdAt: '2026-01-21T10:00:00Z',
    skillCategory: 'technology',
  },

  // swap-10 reviews: Alex <-> David (web dev for photography)
  {
    id: 'review-11',
    swapId: 'swap-10',
    reviewerId: 'user-1',
    revieweeId: 'user-7',
    rating: 5,
    comment:
      'David is a phenomenal photography teacher. Understanding composition and lighting has completely changed how I see the world. My Instagram has never looked better!',
    createdAt: '2026-01-20T09:00:00Z',
    skillCategory: 'photography',
  },
  {
    id: 'review-12',
    swapId: 'swap-10',
    reviewerId: 'user-7',
    revieweeId: 'user-1',
    rating: 5,
    comment:
      'Alex helped me create a stunning portfolio site that really showcases my photography. He has a great eye for design and was brilliant at explaining the technical side.',
    createdAt: '2026-01-20T10:00:00Z',
    skillCategory: 'technology',
  },
];
