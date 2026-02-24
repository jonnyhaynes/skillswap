import { test, expect } from '@playwright/test'

test('browse skills page loads listing cards', async ({ page }) => {
  await page.goto('/browse')
  // At least one skill card should appear from Supabase seed data
  await expect(page.locator('[data-testid="skill-card"]').first()).toBeVisible({ timeout: 10_000 })
})

test('search input is present', async ({ page }) => {
  await page.goto('/browse')
  await expect(page.getByPlaceholder(/search/i)).toBeVisible()
})

test('search filters results without crashing', async ({ page }) => {
  await page.goto('/browse')
  await page.getByPlaceholder(/search/i).fill('piano')
  // Wait for debounce (300ms) + render
  await page.waitForTimeout(500)
  await expect(page).toHaveURL(/browse/)
})

test('skill detail page loads from listing card', async ({ page }) => {
  await page.goto('/browse')
  const firstCard = page.locator('[data-testid="skill-card"]').first()
  await firstCard.waitFor({ timeout: 10_000 })
  await firstCard.click()
  await expect(page).toHaveURL(/\/skills\//)
  await expect(page.getByRole('heading').first()).toBeVisible()
})
