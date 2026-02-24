import { test, expect } from '@playwright/test'

// These tests check unauthenticated flows — override storageState to start fresh
test.use({ storageState: { cookies: [], origins: [] } })

test.beforeEach(async ({ page }) => {
  // Mock Turnstile for all auth tests so the submit button is enabled
  await page.addInitScript(() => {
    window.turnstile = {
      render: (_container, options) => {
        setTimeout(() => options.callback?.('XXXX.DUMMY.TOKEN.XXXX'), 50)
        return 'test-widget-id'
      },
      reset: () => {},
      remove: () => {},
    }
  })
})

test('login page loads with correct fields', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('#login-email')).toBeVisible()
  await expect(page.locator('#login-password')).toBeVisible()
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

test('shows error for invalid credentials', async ({ page }) => {
  await page.goto('/login')
  await page.locator('#login-email').fill('notauser@example.com')
  await page.locator('#login-password').fill('wrongpassword123')
  // Wait for Turnstile mock to enable the button
  await page.getByRole('button', { name: /sign in/i }).waitFor({ state: 'enabled', timeout: 3000 })
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page.getByRole('alert')).toBeVisible({ timeout: 8000 })
})

test('forgot password link navigates correctly', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('link', { name: /forgot password/i }).click()
  await expect(page).toHaveURL(/forgot-password/)
})

test('sign up page loads', async ({ page }) => {
  await page.goto('/signup')
  await expect(page.getByRole('heading').first()).toBeVisible()
})

test('sign up link on login page works', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('link', { name: /sign up/i }).click()
  await expect(page).toHaveURL(/signup/)
})
