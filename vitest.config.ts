import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      env: {
        VITE_SUPABASE_URL: 'https://test.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'test-anon-key',
        VITE_BUGSNAG_API_KEY: 'test-bugsnag-key',
        VITE_CLOUDFLARE_TURNSTILE_SITEKEY: 'test-turnstile-key',
        VITE_OS_NAMES_API_KEY: 'test-os-key',
      },
    },
  })
)
