# Footer Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite Footer.tsx with a balanced 4-column grid where stats live as a quiet "Community" column, removing the full-width stats band, icon components, and CTA banner.

**Architecture:** Single file rewrite of `src/components/layout/Footer.tsx`. The `CommunityStat` component replaces `FooterStat` — same `useCountUp` hook, no icons, smaller typography. The 4-column grid gives Brand, Explore, Legal, and Community equal weight. The CTA banner is replaced with an inline "Get started →" link inside the Brand column for logged-out users only.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, `useSkills` hook (Supabase), `useCountUp` hook

---

### Task 1: Rewrite Footer.tsx

**Files:**
- Modify: `src/components/layout/Footer.tsx`

**Step 1: Replace the entire contents of Footer.tsx with the following**

```tsx
import { Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useSkills } from '@/hooks/useSkills'
import { useCountUp } from '@/hooks/useCountUp'

const COMMUNITY_STATS = [
  { label: 'Skills Available', key: 'offered' as const },
  { label: 'Skills Wanted', key: 'wanted' as const },
  { label: 'Total Listings', key: 'total' as const },
  { label: 'Categories', key: 'categories' as const },
]

function CommunityStat({ value, label }: { value: number | string; label: string }) {
  const numericValue = typeof value === 'number' ? value : 0
  const isLoading = typeof value === 'string'
  const { count, ref, finished } = useCountUp(numericValue)

  return (
    <div ref={ref} className="flex items-baseline gap-2">
      <span
        className={`text-xl font-bold text-white font-display tabular-nums leading-none${finished ? ' stat-pop' : ''}`}
      >
        {isLoading ? '—' : count}
      </span>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  )
}

export function Footer() {
  const { currentUser } = useAuth()
  const { listings, loading } = useSkills()
  const offeredCount = listings.filter((l) => l.listingType === 'offered').length
  const wantedCount = listings.filter((l) => l.listingType === 'wanted').length

  const statValues: Record<string, number | string> = {
    offered: loading ? '...' : offeredCount,
    wanted: loading ? '...' : wantedCount,
    total: loading ? '...' : listings.length,
    categories: 12,
  }

  return (
    <footer className="relative">
      {/* Organic wave divider */}
      <div className="bg-transparent" aria-hidden="true">
        <svg
          className="block w-full h-10 sm:h-14 text-slate-900"
          viewBox="0 0 1440 56"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0 28c240-20 480 16 720 8s480-28 720-8v28H0Z" />
        </svg>
      </div>

      <div className="bg-slate-900 text-slate-300 relative overflow-hidden pb-16 md:pb-0">
        {/* Topographic pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c13.807 0 25 11.193 25 25S43.807 55 30 55 5 43.807 5 30 16.193 5 30 5Zm0 8c-9.389 0-17 7.611-17 17s7.611 17 17 17 17-7.611 17-17-7.611-17-17-17Zm0 8a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z' fill='none' stroke='white' stroke-width='.5'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Footer Content */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="footer-logo-grad"
                      x1="0"
                      y1="0"
                      x2="32"
                      y2="32"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#43c1a6" />
                      <stop offset="1" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <rect
                    width="32"
                    height="32"
                    rx="10"
                    fill="url(#footer-logo-grad)"
                  />
                  <path
                    d="M10 18.5h7m0 0l-3-3m3 3l-3 3"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 13.5h-7m0 0l3-3m-3 3l3 3"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.7"
                  />
                </svg>
                <span className="text-base font-extrabold text-white font-display">
                  SkillSwap
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-400 max-w-xs leading-relaxed">
                Connecting neighbours through skills. Teach what you know, learn
                what you love.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <a href="https://bsky.app/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors" aria-label="Bluesky">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.588 3.476 6.15 3.167-3.678.555-6.903 1.904-4.415 6.655 2.946 4.986 7.202 3.592 9.641.636.306-.37.572-.753.798-1.128.226.375.492.757.798 1.128 2.44 2.956 6.696 4.35 9.641-.636 2.488-4.751-.737-6.1-4.415-6.655 2.562.309 5.365-.54 6.15-3.167C25.622 9.418 26 4.458 26 3.768c0-.689-.139-1.861-.902-2.203-.659-.3-1.664-.62-4.3 1.24C18.046 4.748 15.087 8.687 14 10.8h-2Z" transform="scale(0.923)" />
                  </svg>
                </a>
                <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors" aria-label="Facebook">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.47h-2.796v8.384C19.612 22.954 24 17.99 24 12Z" />
                  </svg>
                </a>
                <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors" aria-label="Instagram">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
                  </svg>
                </a>
                <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
                  </svg>
                </a>
              </div>
              {!currentUser && (
                <Link
                  to="/signup"
                  className="mt-5 inline-flex items-center text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Get started →
                </Link>
              )}
            </div>

            {/* Explore */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Explore</h3>
              <nav className="flex flex-col gap-2 text-sm" aria-label="Explore links">
                <Link to="/browse" className="text-slate-400 hover:text-white transition-colors">
                  Browse Skills
                </Link>
                <Link to="/skills/new" className="text-slate-400 hover:text-white transition-colors">
                  Post a Skill
                </Link>
              </nav>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Legal</h3>
              <nav className="flex flex-col gap-2 text-sm" aria-label="Legal links">
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </nav>
            </div>

            {/* Community stats */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Community</h3>
              <div className="flex flex-col gap-2.5">
                {COMMUNITY_STATS.map((stat) => (
                  <CommunityStat
                    key={stat.label}
                    value={statValues[stat.key]}
                    label={stat.label}
                  />
                ))}
              </div>
            </div>

          </div>

          <div className="mt-12 border-t border-slate-800 pt-8 text-center">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} SkillSwap. A{' '}
              <a
                href="https://www.colouringcode.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:underline focus:underline"
              >
                Colouring Code
              </a>{' '}
              design and build. Made in Rotherham.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

**Step 2: Run build to verify TypeScript compiles**

```bash
cd /Users/jonnyhaynes/Projects/claude/skillswap && npm run build
```

Expected: 0 TypeScript errors, modules transform successfully.

**Step 3: Run tests**

```bash
cd /Users/jonnyhaynes/Projects/claude/skillswap && npm run test -- --run
```

Expected: 77 tests pass across 14 files.

**Step 4: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: redesign footer with 4-column grid and subtle community stats"
```

---

### Task 2: Visual QA

**Step 1: Start dev server (or confirm already running)**

The dev server may already be running on port 5174. If not:
```bash
cd /Users/jonnyhaynes/Projects/claude/skillswap && npm run dev
```

**Step 2: Check the footer on the home page**

Navigate to `http://localhost:5174/` and scroll to the bottom.

Verify:
- Wave divider → dark footer
- 4 equal columns: SkillSwap brand | Explore | Legal | Community
- Brand column: logo, tagline, social icons, "Get started →" link (logged-out) or no CTA link (logged-in)
- Community column: heading "Community", then 4 stacked rows — each `[number] [label]` e.g. `11 Skills Available`
- Numbers are `text-xl` (small, not giant)
- No standalone stats band above the grid
- No full-width CTA banner

**Step 3: Check the footer on the browse page**

Navigate to `http://localhost:5174/browse` and scroll to the bottom. Verify the same footer appears identically.

**Step 4: Check responsive at mobile width (375px)**

Resize browser. Verify:
- Columns stack to 1-col on mobile, 2-col on tablet
- Community stats remain readable

**Step 5: Confirm no console errors**

Open browser dev tools. Expected: 0 errors.
