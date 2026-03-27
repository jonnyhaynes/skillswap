# Verified Neighbour Design

## Overview

Implement auto-verification for users based on swap completion and review ratings. A user earns the "Verified Neighbour" badge when they have 5+ completed swaps with a perfect 5.0 average review rating. Admin override remains available via direct database updates.

## Verification Rules

- **5 or more completed swaps** (status = 'completed', user as proposer or recipient)
- **Average review rating of 5.0** (all reviews where user is reviewee must be 5-star)
- Verification is recalculated on each new review insert
- Admin can manually override via Supabase dashboard (trigger will re-evaluate on next review)

## Database Trigger

New migration: `011_verified_neighbour_trigger.sql`

### Function: `recalculate_verified_neighbour(user_uuid UUID)`

```sql
-- Counts completed swaps for user (as proposer or recipient)
-- Calculates average rating from all reviews where user is reviewee
-- Sets is_verified_neighbour = true if completed_swaps >= 5 AND avg_rating = 5.0
-- Sets is_verified_neighbour = false otherwise
-- SECURITY DEFINER to bypass RLS (reviewer updates reviewee's profile)
```

### Trigger: `on_review_inserted`

- Fires AFTER INSERT on `reviews` table
- Calls `recalculate_verified_neighbour(NEW.reviewee_id)`

## Seed Data Changes

### Users (`src/data/users.ts`)

- Alex Chen (user-1): `isVerifiedNeighbour: true` (earns it via 5 completed swaps + all 5-star reviews)
- All other users: `isVerifiedNeighbour: false`

### Swaps (`src/data/swaps.ts`)

Keep existing swaps. Add 4 new completed swaps for Alex:
- swap-7: Alex <-> James (web dev for cooking)
- swap-8: Alex <-> Tom (web dev for carpentry)
- swap-9: Alex <-> Lena (React mentoring for German)
- swap-10: Alex <-> David (web dev for photography)

Total completed swaps for Alex: 5 (swap-1 + swap-7 through swap-10)

### Reviews (`src/data/reviews.ts`)

Keep existing reviews. Add reviews for new swaps:
- Each new swap gets 2 reviews (both parties)
- All reviews OF Alex (reviewee) are 5-star
- Alex's reviews of others use varied ratings (realistic)

### Conversations & Messages

Add minimal conversations for new swaps (conv-7 through conv-10).

## Frontend

No changes needed. `VerifiedBadge` component already renders wherever `isVerifiedNeighbour` is checked across: SkillCard, ProfileHeader, SwapCard, SwapDetailPage, ConversationPage, ConversationItem, ReviewCard, Header.

## RLS

Trigger function uses `SECURITY DEFINER` to update the reviewee's profile row when a review is inserted by the reviewer.
