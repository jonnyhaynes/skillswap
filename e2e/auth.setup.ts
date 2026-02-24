import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, 'fixtures/.auth.json')

setup('authenticate', async ({ page }) => {
  // Mock window.turnstile before the page loads so the CAPTCHA widget
  // auto-fires its callback — enabling the Sign in button without a real CAPTCHA solve.
  // The server-side Turnstile validation must be configured to accept this token:
  // Use sitekey 1x00000000000000000000AA + secret 1x0000000000000000000000000000000AA
  // (Cloudflare's official test credentials — always passes).
  await page.addInitScript(() => {
    window.turnstile = {
      render: (_container, options) => {
        // Auto-fire the success callback with the Cloudflare test bypass token
        setTimeout(() => options.callback?.('XXXX.DUMMY.TOKEN.XXXX'), 50)
        return 'test-widget-id'
      },
      reset: () => {},
      remove: () => {},
    }
  })

  await page.goto('/login')

  await page.locator('#login-email').fill('test@skillswap.test')
  await page.locator('#login-password').fill(process.env.E2E_TEST_PASSWORD!)

  // Wait for Turnstile mock to fire (enables the submit button)
  await page.getByRole('button', { name: /sign in/i }).waitFor({ state: 'enabled', timeout: 3000 })
  await page.getByRole('button', { name: /sign in/i }).click()

  // Wait for redirect after successful login
  await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 })

  await page.context().storageState({ path: authFile })
})
