# Verified Neighbour Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-verify users who complete 5+ swaps with a perfect 5-star average review rating, backed by a database trigger and updated seed data.

**Architecture:** A Supabase database trigger fires after each review insert, recalculating the reviewee's `is_verified_neighbour` status. Seed data is expanded so Alex Chen (user-1) legitimately qualifies with 5 completed swaps and all 5-star reviews. All other users are set to unverified.

**Tech Stack:** Supabase (PostgreSQL triggers/functions), TypeScript, React seed data files

---

### Task 1: Create the database migration

**Files:**
- Create: `supabase/migrations/011_verified_neighbour_trigger.sql`

**Step 1: Create the migration file**

```sql
-- Verified Neighbour Auto-Verification Trigger
-- Recalculates is_verified_neighbour when a review is inserted.
-- Criteria: 5+ completed swaps AND average review rating = 5.0

CREATE OR REPLACE FUNCTION recalculate_verified_neighbour(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  swap_count INTEGER;
  avg_rating NUMERIC;
BEGIN
  -- Count completed swaps where user is proposer or recipient
  SELECT COUNT(*) INTO swap_count
  FROM public.swap_proposals
  WHERE status = 'completed'
    AND (proposer_id = user_uuid OR recipient_id = user_uuid);

  -- Calculate average rating from reviews where user is reviewee
  SELECT AVG(rating)::NUMERIC INTO avg_rating
  FROM public.reviews
  WHERE reviewee_id = user_uuid;

  -- Update verification status
  UPDATE public.profiles
  SET is_verified_neighbour = (swap_count >= 5 AND avg_rating = 5.0)
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function that extracts reviewee_id and calls recalculate
CREATE OR REPLACE FUNCTION on_review_inserted()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalculate_verified_neighbour(NEW.reviewee_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fire after every review insert
CREATE TRIGGER trigger_recalculate_verified_neighbour
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION on_review_inserted();
```

**Step 2: Verify the SQL is syntactically correct**

Read back the file and check:
- `recalculate_verified_neighbour` accepts UUID, returns VOID, is SECURITY DEFINER
- `on_review_inserted` returns TRIGGER, calls PERFORM on the function
- Trigger fires AFTER INSERT on reviews FOR EACH ROW

**Step 3: Commit**

```bash
git add supabase/migrations/011_verified_neighbour_trigger.sql
git commit -m "feat: add database trigger for auto-verifying neighbours

Recalculates is_verified_neighbour on review insert.
Criteria: 5+ completed swaps with 5.0 average rating."
```

---

### Task 2: Update seed users - set only Alex as verified

**Files:**
- Modify: `src/data/users.ts`

**Step 1: Update verification flags**

Set `isVerifiedNeighbour: true` only for user-1 (Alex Chen). Set all others to `false`.

Changes:
- user-1 (Alex): keep `isVerifiedNeighbour: true`
- user-2 (Maria): change to `isVerifiedNeighbour: false`
- user-3 (James): change to `isVerifiedNeighbour: false`
- user-5 (Tom): change to `isVerifiedNeighbour: false`
- user-7 (David): change to `isVerifiedNeighbour: false`
- user-8 (Sarah): change to `isVerifiedNeighbour: false`
- user-4 (Priya): already `false`
- user-6 (Lena): already `false`

**Step 2: Commit**

```bash
git add src/data/users.ts
git commit -m "fix: only Alex Chen is verified in seed data

Other users no longer meet the 5-swap/5-star criteria."
```

---

### Task 3: Add 4 new completed swaps for Alex

**Files:**
- Modify: `src/data/swaps.ts`

**Step 1: Add new completed swaps**

Alex (user-1) already has 1 completed swap (swap-1 with Maria). Add 4 more to reach 5 total. Each swap pairs Alex's offered skills with another user's offered skill.

Add after the existing swaps array entries (before the closing `]`):

```typescript
  // swap-7: Alex <-> James (web dev for cooking) - completed
  {
    id: 'swap-7',
    proposerId: 'user-3',
    recipientId: 'user-1',
    offeredSkillId: 'skill-5',
    requestedSkillId: 'skill-1',
    message:
      'Hi Alex! I have been meaning to get a basic website set up for the restaurant. Your web dev skills would be perfect. I can teach you Italian cooking in return - we can use the restaurant kitchen!',
    status: 'completed',
    proposedAt: '2025-12-12T10:00:00Z',
    respondedAt: '2025-12-13T09:00:00Z',
    completedAt: '2026-01-15T17:00:00Z',
    conversationId: 'conv-7',
    proposerCompleted: true,
    recipientCompleted: true,
  },
  // swap-8: Alex <-> Tom (web dev for carpentry) - completed
  {
    id: 'swap-8',
    proposerId: 'user-1',
    recipientId: 'user-5',
    offeredSkillId: 'skill-1',
    requestedSkillId: 'skill-9',
    message:
      'Hi Tom! I have a wobbly bookshelf and a desk that needs some love. Happy to help you set up a website for your carpentry business in return. What do you think?',
    status: 'completed',
    proposedAt: '2025-12-18T14:00:00Z',
    respondedAt: '2025-12-19T11:00:00Z',
    completedAt: '2026-01-18T16:00:00Z',
    conversationId: 'conv-8',
    proposerCompleted: true,
    recipientCompleted: true,
  },
  // swap-9: Alex <-> Lena (React mentoring for German) - completed
  {
    id: 'swap-9',
    proposerId: 'user-6',
    recipientId: 'user-1',
    offeredSkillId: 'skill-11',
    requestedSkillId: 'skill-18',
    message:
      'Hey Alex, I am building a language learning app and could really use some React guidance. I can offer German lessons in return - always useful if you travel to Berlin!',
    status: 'completed',
    proposedAt: '2025-12-22T09:00:00Z',
    respondedAt: '2025-12-23T10:30:00Z',
    completedAt: '2026-01-20T15:00:00Z',
    conversationId: 'conv-9',
    proposerCompleted: true,
    recipientCompleted: true,
  },
  // swap-10: Alex <-> David (web dev for photography) - completed
  {
    id: 'swap-10',
    proposerId: 'user-1',
    recipientId: 'user-7',
    offeredSkillId: 'skill-1',
    requestedSkillId: 'skill-14',
    message:
      'Hi David! I have seen your photography work and it is stunning. I would love to learn the basics of composition and lighting. Can offer web dev help in return - maybe a portfolio site?',
    status: 'completed',
    proposedAt: '2025-12-20T11:00:00Z',
    respondedAt: '2025-12-21T08:00:00Z',
    completedAt: '2026-01-19T14:00:00Z',
    conversationId: 'conv-10',
    proposerCompleted: true,
    recipientCompleted: true,
  },
```

**Step 2: Verify the data is consistent**

Check:
- Each swap has unique id (swap-7 through swap-10)
- Each references valid user IDs and skill IDs from existing seed data
- Each references a new conversation ID (conv-7 through conv-10)
- All have `status: 'completed'`, `proposerCompleted: true`, `recipientCompleted: true`
- `completedAt` dates are before the review dates (Task 4)

**Step 3: Commit**

```bash
git add src/data/swaps.ts
git commit -m "feat: add 4 completed swaps for Alex Chen

Alex now has 5 total completed swaps to support verified status."
```

---

### Task 4: Add reviews for new completed swaps

**Files:**
- Modify: `src/data/reviews.ts`

**Step 1: Add reviews for swap-7 through swap-10**

Each swap gets 2 reviews (both parties). All reviews OF Alex (reviewee) are 5-star. Alex's reviews of others use varied but positive ratings.

Note: Keep existing reviews (review-1 through review-4) unchanged. The existing review-2 (Maria reviewing Alex on swap-1) is already 5-star.

Add after the existing reviews:

```typescript
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
```

**Step 2: Verify Alex's review data**

After all reviews, Alex (user-1) as reviewee should have:
- review-2: swap-1, from Maria, rating 5 (existing)
- review-6: swap-7, from James, rating 5
- review-8: swap-8, from Tom, rating 5
- review-10: swap-9, from Lena, rating 5
- review-12: swap-10, from David, rating 5

Total: 5 reviews, all 5-star, average = 5.0. Combined with 5 completed swaps = verified.

**Step 3: Commit**

```bash
git add src/data/reviews.ts
git commit -m "feat: add reviews for Alex's completed swaps

All reviews of Alex are 5-star, qualifying for verified status."
```

---

### Task 5: Add conversations for new swaps

**Files:**
- Modify: `src/data/messages.ts`

**Step 1: Add conversations for swap-7 through swap-10**

Add to the `conversations` array (before the closing `]`):

```typescript
  {
    id: 'conv-7',
    participantIds: ['user-3', 'user-1'],
    swapId: 'swap-7',
    createdAt: '2025-12-12T10:00:00Z',
    lastMessageAt: '2026-01-15T17:00:00Z',
    lastMessagePreview: 'Thanks for the website Alex, it looks brilliant!',
  },
  {
    id: 'conv-8',
    participantIds: ['user-1', 'user-5'],
    swapId: 'swap-8',
    createdAt: '2025-12-18T14:00:00Z',
    lastMessageAt: '2026-01-18T16:00:00Z',
    lastMessagePreview: 'The bookshelf is rock solid now, cheers Tom!',
  },
  {
    id: 'conv-9',
    participantIds: ['user-6', 'user-1'],
    swapId: 'swap-9',
    createdAt: '2025-12-22T09:00:00Z',
    lastMessageAt: '2026-01-20T15:00:00Z',
    lastMessagePreview: 'Danke schön for the React help, Alex!',
  },
  {
    id: 'conv-10',
    participantIds: ['user-1', 'user-7'],
    swapId: 'swap-10',
    createdAt: '2025-12-20T11:00:00Z',
    lastMessageAt: '2026-01-19T14:00:00Z',
    lastMessagePreview: 'Portfolio site is live, really happy with it!',
  },
```

**Step 2: Add messages for new conversations**

Add to the `messages` array (before the closing `]`):

```typescript
  // conv-7: James <-> Alex (cooking for web dev)
  {
    id: 'msg-32',
    conversationId: 'conv-7',
    senderId: 'user-3',
    content:
      'Hi Alex! I have been meaning to get a basic website set up for the restaurant. Your web dev skills would be perfect. I can teach you Italian cooking in return - we can use the restaurant kitchen!',
    sentAt: '2025-12-12T10:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-33',
    conversationId: 'conv-7',
    senderId: 'user-1',
    content:
      'James, that sounds amazing! I have been to your place and the food is incredible. Would love to learn some of those pasta techniques. Let us do it!',
    sentAt: '2025-12-13T09:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-34',
    conversationId: 'conv-7',
    senderId: 'user-3',
    content:
      'Thanks for the website Alex, it looks brilliant! Already had a few online reservations come through.',
    sentAt: '2026-01-15T17:00:00Z',
    isRead: true,
  },

  // conv-8: Alex <-> Tom (web dev for carpentry)
  {
    id: 'msg-35',
    conversationId: 'conv-8',
    senderId: 'user-1',
    content:
      'Hi Tom! I have a wobbly bookshelf and a desk that needs some love. Happy to help you set up a website for your carpentry business in return. What do you think?',
    sentAt: '2025-12-18T14:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-36',
    conversationId: 'conv-8',
    senderId: 'user-5',
    content:
      'Sounds like a deal, Alex! Bring the bookshelf round to the workshop on Saturday and we will sort it out. A website would be a game changer for getting new customers.',
    sentAt: '2025-12-19T11:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-37',
    conversationId: 'conv-8',
    senderId: 'user-1',
    content:
      'The bookshelf is rock solid now, cheers Tom! Your website is live too - let me know if you want to tweak anything.',
    sentAt: '2026-01-18T16:00:00Z',
    isRead: true,
  },

  // conv-9: Lena <-> Alex (German for React mentoring)
  {
    id: 'msg-38',
    conversationId: 'conv-9',
    senderId: 'user-6',
    content:
      'Hey Alex, I am building a language learning app and could really use some React guidance. I can offer German lessons in return - always useful if you travel to Berlin!',
    sentAt: '2025-12-22T09:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-39',
    conversationId: 'conv-9',
    senderId: 'user-1',
    content:
      'Hi Lena! I have actually been wanting to learn German for a while. A language app sounds like a great project to mentor on too. Let us set something up!',
    sentAt: '2025-12-23T10:30:00Z',
    isRead: true,
  },
  {
    id: 'msg-40',
    conversationId: 'conv-9',
    senderId: 'user-6',
    content:
      'Danke schön for the React help, Alex! The app is really coming together and my understanding of components has clicked.',
    sentAt: '2026-01-20T15:00:00Z',
    isRead: true,
  },

  // conv-10: Alex <-> David (web dev for photography)
  {
    id: 'msg-41',
    conversationId: 'conv-10',
    senderId: 'user-1',
    content:
      'Hi David! I have seen your photography work and it is stunning. I would love to learn the basics of composition and lighting. Can offer web dev help in return - maybe a portfolio site?',
    sentAt: '2025-12-20T11:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-42',
    conversationId: 'conv-10',
    senderId: 'user-7',
    content:
      'Alex, that would be perfect! I have been needing a proper portfolio site for ages. Happy to teach you photography - we could do some walks around Victoria Park for the practical sessions.',
    sentAt: '2025-12-21T08:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-43',
    conversationId: 'conv-10',
    senderId: 'user-7',
    content:
      'Portfolio site is live, really happy with it! Your photos from last weekend were great too - you have got a real eye for it.',
    sentAt: '2026-01-19T14:00:00Z',
    isRead: true,
  },
```

**Step 3: Commit**

```bash
git add src/data/messages.ts
git commit -m "feat: add conversations and messages for Alex's new swaps

Adds conv-7 through conv-10 with realistic message threads."
```

---

### Task 6: Verify the build passes

**Step 1: Run the TypeScript compiler**

Run: `npx tsc --noEmit`
Expected: No type errors

**Step 2: Run the dev build**

Run: `npx vite build`
Expected: Build succeeds with no errors

**Step 3: Commit if any fixes were needed**

If fixes were required, commit them with an appropriate message.

---

### Task 7: Final verification and summary commit

**Step 1: Verify seed data consistency**

Check the following by reading files:
- Alex (user-1) has exactly 5 completed swaps: swap-1, swap-7, swap-8, swap-9, swap-10
- Alex has exactly 5 reviews as reviewee, all rating 5: review-2, review-6, review-8, review-10, review-12
- All other users have `isVerifiedNeighbour: false`
- All new swaps reference valid skill IDs and conversation IDs
- All new conversations reference valid swap IDs and participant IDs
- Review dates are after swap completion dates

**Step 2: Visual spot-check (if dev server available)**

Run: `npx vite dev`
- Navigate to Alex's profile - should show verified badge
- Navigate to another user's profile - should NOT show verified badge
- Browse skills page - Alex's skill cards should show the badge
