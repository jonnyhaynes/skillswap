import { test as base } from '@playwright/test'

// Re-export base test — auth state is already applied via storageState in playwright.config.ts
export { expect } from '@playwright/test'
export const test = base
