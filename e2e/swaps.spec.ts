import { test, expect } from '@playwright/test'

test('swaps page loads while authenticated', async ({ page }) => {
  await page.goto('/swaps')
  await expect(page).toHaveURL(/swaps/)
  await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 })
})

test('shows swap cards or empty state', async ({ page }) => {
  await page.goto('/swaps')
  // Either swap cards exist, or an empty-state message is shown — both are valid
  const swapCards = page.locator('[data-testid="swap-card"]')
  const hasCards = (await swapCards.count()) > 0

  if (hasCards) {
    await expect(swapCards.first()).toBeVisible()
  } else {
    // Empty state — page should still render without errors
    await expect(page.getByRole('heading').first()).toBeVisible()
  }
})

test('navigates to swap detail when card is clicked', async ({ page }) => {
  await page.goto('/swaps')
  const swapCard = page.locator('[data-testid="swap-card"]').first()
  const hasSwaps = (await swapCard.count()) > 0

  if (hasSwaps) {
    await swapCard.click()
    await expect(page).toHaveURL(/\/swaps\//)
    await expect(page.getByRole('heading').first()).toBeVisible()
  } else {
    test.skip()
  }
})
