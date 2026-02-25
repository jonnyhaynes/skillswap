import { test, expect } from './fixtures/auth'

test.describe('Account settings — Security section', () => {
  test('shows Security section with Email and Password rows', async ({ page }) => {
    await page.goto('/settings/account')
    await expect(page.getByRole('heading', { name: 'Security' })).toBeVisible()
    await expect(page.getByText('Email')).toBeVisible()
    await expect(page.getByText('Password')).toBeVisible()
  })

  test('email row shows Change button', async ({ page }) => {
    await page.goto('/settings/account')
    const emailRow = page.getByTestId('email-row')
    await expect(emailRow.getByRole('button', { name: 'Change' })).toBeVisible()
  })

  test('clicking Change on email row expands the form', async ({ page }) => {
    await page.goto('/settings/account')
    const emailRow = page.getByTestId('email-row')
    await emailRow.getByRole('button', { name: 'Change' }).click()
    await expect(page.getByLabel('Current password').first()).toBeVisible()
    await expect(page.getByLabel('New email address')).toBeVisible()
  })

  test('Cancel collapses the email form', async ({ page }) => {
    await page.goto('/settings/account')
    const emailRow = page.getByTestId('email-row')
    await emailRow.getByRole('button', { name: 'Change' }).click()
    await emailRow.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByLabel('New email address')).not.toBeVisible()
  })

  test('clicking Change on password row expands the form', async ({ page }) => {
    await page.goto('/settings/account')
    const passwordRow = page.getByTestId('password-row')
    await passwordRow.getByRole('button', { name: 'Change' }).click()
    await expect(page.getByLabel('New password', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirm new password')).toBeVisible()
  })

  test('Account information section shows Member since', async ({ page }) => {
    await page.goto('/settings/account')
    await expect(page.getByText('Member since')).toBeVisible()
  })

  test('Danger zone is still visible', async ({ page }) => {
    await page.goto('/settings/account')
    await expect(page.getByRole('heading', { name: 'Danger zone' })).toBeVisible()
  })
})
