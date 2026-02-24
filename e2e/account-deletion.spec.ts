// e2e/account-deletion.spec.ts
import { test, expect } from './fixtures/auth'

test.describe('Account deletion', () => {
  test('navigates to /settings/account and shows the danger zone', async ({ page }) => {
    await page.goto('/settings/account')
    await expect(page.getByRole('heading', { name: 'Account settings' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Danger zone' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Delete account' })).toBeVisible()
  })

  test('shows consequences step when Delete account is clicked', async ({ page }) => {
    await page.goto('/settings/account')
    await page.getByRole('button', { name: 'Delete account' }).click()
    await expect(page.getByRole('heading', { name: 'Delete your account' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Download your data/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue →' })).toBeVisible()
  })

  test('cancel returns to idle state', async ({ page }) => {
    await page.goto('/settings/account')
    await page.getByRole('button', { name: 'Delete account' }).click()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('button', { name: 'Delete account' })).toBeVisible()
  })

  test('Download your data button triggers a file download', async ({ page }) => {
    await page.goto('/settings/account')
    await page.getByRole('button', { name: 'Delete account' }).click()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /Download your data/ }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('skillswap-data-export.json')
  })

  test('confirm button is disabled until DELETE is typed exactly', async ({ page }) => {
    await page.goto('/settings/account')
    await page.getByRole('button', { name: 'Delete account' }).click()
    await page.getByRole('button', { name: 'Continue →' }).click()

    const confirmButton = page.getByTestId('confirm-delete-button')
    await expect(confirmButton).toBeDisabled()

    await page.getByTestId('delete-confirmation-input').fill('delete')
    await expect(confirmButton).toBeDisabled()

    await page.getByTestId('delete-confirmation-input').fill('DELETE')
    await expect(confirmButton).toBeEnabled()
  })

  test('go back returns to consequences step', async ({ page }) => {
    await page.goto('/settings/account')
    await page.getByRole('button', { name: 'Delete account' }).click()
    await page.getByRole('button', { name: 'Continue →' }).click()
    await page.getByRole('button', { name: '← Go back' }).click()
    await expect(page.getByRole('heading', { name: 'Delete your account' })).toBeVisible()
  })

  // Skipped: destructive test — run manually against a throwaway account.
  // To run: create a fresh test user, set E2E_TEST_EMAIL/PASSWORD to that user,
  // run `npx playwright test account-deletion.spec.ts --grep "deletes the account"`
  test.skip('deletes the account, signs out, and redirects to home', async ({ page }) => {
    await page.goto('/settings/account')
    await page.getByRole('button', { name: 'Delete account' }).click()
    await page.getByRole('button', { name: 'Continue →' }).click()
    await page.getByTestId('delete-confirmation-input').fill('DELETE')
    await page.getByTestId('confirm-delete-button').click()

    // Should redirect to home after deletion
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })
})
