import { test, expect } from '@playwright/test'

test('edit profile page is accessible while authenticated', async ({ page }) => {
  await page.goto('/profile/edit')
  await expect(page).toHaveURL(/profile/)
  await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 })
})

test('my listings page is accessible', async ({ page }) => {
  await page.goto('/my-listings')
  await expect(page).toHaveURL(/my-listings/)
  await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 })
})
