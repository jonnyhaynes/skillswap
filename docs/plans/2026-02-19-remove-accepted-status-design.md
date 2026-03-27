# Design: Remove `accepted` Swap Status

**Date:** 2026-02-19

## Summary

When a recipient accepts a swap proposal, skip the intermediate `accepted` state and immediately mark the swap as `in_progress`. Remove `accepted` from the `swap_status` enum entirely.

## Status Flow

Before: `pending` → `accepted` → `in_progress` → `completed` / `cancelled`
After:  `pending` → `in_progress` → `completed` / `cancelled`

## Database Migration

New migration `012_remove_accepted_status.sql`:

1. Update any existing `accepted` rows to `in_progress` (set `status = 'in_progress'`)
2. Remove `accepted` from the `swap_status` enum (requires creating a new type, swapping it in, dropping the old)
3. Ensure `responded_at` is set on those rows

## Frontend Changes

- `acceptProposal()` in `SwapsContext` calls `updateSwapStatus(id, 'in_progress')` instead of `'accepted'`
- `swaps.ts` service: extend `respondedAt` timestamp logic to cover `'in_progress'` (replace `'accepted'` check)
- `SwapActions`: remove the "Start Progress" button — no longer reachable
- Any `status === 'accepted'` checks in UI (badges, timeline, conditional rendering) updated to `status === 'in_progress'`

## Seed Data

- `supabase/seed.sql`: Swap 2 (Priya ↔ Alex) changes from `accepted` to `in_progress`
- `src/data/*.ts`: same update if `accepted` appears there
