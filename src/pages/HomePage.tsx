import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useSkills } from '@/hooks/useSkills'
import { useCountUp } from '@/hooks/useCountUp'
import { SkillGrid } from '@/components/skills/SkillGrid'

function TargetIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}

function SearchIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  )
}

function ListIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M9 5h11M9 12h11M9 19h11M5 5h.01M5 12h.01M5 19h.01" />
    </svg>
  )
}

function GridIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  )
}

const STATS_CONFIG = [
  { label: 'Skills Available', key: 'offered' as const, icon: TargetIcon },
  { label: 'Skills Wanted', key: 'wanted' as const, icon: SearchIcon },
  { label: 'Total Listings', key: 'total' as const, icon: ListIcon },
  { label: 'Categories', key: 'categories' as const, icon: GridIcon },
]

function AnimatedStat({ value, label, icon: Icon }: { value: number | string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  const numericValue = typeof value === 'number' ? value : 0
  const isLoading = typeof value === 'string'
  const { count, ref } = useCountUp(numericValue)

  return (
    <div ref={ref} className="py-6 px-4 text-center">
      <Icon className="w-5 h-5 text-white/50 mx-auto" />
      <div className="text-4xl sm:text-5xl font-extrabold text-white font-display mt-2 tabular-nums">
        {isLoading ? '...' : count}
      </div>
      <div className="text-xs uppercase tracking-wider text-white/50 mt-2 font-semibold">{label}</div>
    </div>
  )
}

const STEPS = [
  {
    step: '1',
    title: 'Choose a Skill',
    desc: 'Post what you can teach or browse what others are offering near you.',
    icon: ClipboardIcon,
    gradient: 'from-[#2DD4BF] to-[#3B82F6]',
    bg: 'bg-primary-50',
  },
  {
    step: '2',
    title: 'Match with a Person',
    desc: 'Find someone whose skills complement yours and propose a swap.',
    icon: PeopleIcon,
    gradient: 'from-[#FB7185] to-[#F472B6]',
    bg: 'bg-amber-50',
  },
  {
    step: '3',
    title: 'Swap Time, Not Money',
    desc: 'Meet up, learn from each other, and leave reviews when you\'re done.',
    icon: SparkleIcon,
    gradient: 'from-[#A78BFA] to-[#22D3EE]',
    bg: 'bg-blue-50',
  },
]

export function HomePage() {
  const { currentUser } = useAuth()
  const { listings, loading } = useSkills()
  const navigate = useNavigate()
  const [heroSearch, setHeroSearch] = useState('')

  const featuredSkills = useMemo(() => {
    return listings
      .filter((l) => l.userId !== currentUser?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
  }, [listings, currentUser])

  const offeredCount = listings.filter((l) => l.listingType === 'offered').length
  const wantedCount = listings.filter((l) => l.listingType === 'wanted').length

  const statValues: Record<string, number | string> = {
    offered: loading ? '...' : offeredCount,
    wanted: loading ? '...' : wantedCount,
    total: loading ? '...' : listings.length,
    categories: 12,
  }

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (heroSearch.trim()) {
      navigate(`/browse?search=${encodeURIComponent(heroSearch.trim())}`)
    } else {
      navigate('/browse')
    }
  }

  return (
    <div className="space-y-12">
      {/* Hero + Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 via-primary-600 to-teal-400">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute bottom-1/3 left-1/6 w-20 h-20 bg-white/5 rounded-full" />

        {/* Hero content */}
        <div className="relative z-10 text-center pt-12 sm:pt-16 px-6 pb-8">
          {currentUser ? (
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display leading-tight">
              Welcome back, {currentUser.firstName}!
            </h1>
          ) : (
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display leading-tight">
              Learn what you need.
              <br />
              <span className="text-teal-200">Teach what you know.</span>
            </h1>
          )}
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Swap skills with your neighbours — no money, just knowledge.
          </p>

          {/* Floating glass search bar */}
          <form onSubmit={handleHeroSearch} className="mt-8 max-w-xl mx-auto">
            <div className="glass-dark rounded-2xl flex items-center gap-3 px-5 py-3">
              <SearchIcon className="w-5 h-5 text-white/50 shrink-0" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Photography, Excel, Guitar..."
                className="flex-1 bg-transparent text-white placeholder-white/40 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-white px-5 py-2 text-sm font-semibold text-primary-700 hover:bg-white/90 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {currentUser ? (
              <>
                <Link
                  to="/skills/new"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-semibold text-primary-700 hover:bg-white/90 transition-colors shadow-lg shadow-primary-900/20"
                >
                  Offer a Skill
                </Link>
                <Link
                  to="/browse"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/30 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Find a Skill
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/browse"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-semibold text-primary-700 hover:bg-white/90 transition-colors shadow-lg shadow-primary-900/20"
                >
                  Find a Skill
                </Link>
                <Link
                  to="/skills/new"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/30 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Offer a Skill
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats bar — glass morphism */}
        <div className="relative z-10 mx-4 sm:mx-8 mb-6 rounded-xl glass-dark">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {STATS_CONFIG.map((stat) => (
              <AnimatedStat key={stat.label} value={statValues[stat.key]} label={stat.label} icon={stat.icon} />
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mb-6">How SkillSwap Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 border-t-2 border-dashed border-primary-200" />

          {STEPS.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.step} className={`${item.bg} rounded-2xl p-8 relative`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center text-base font-bold shrink-0`}>
                    {item.step}
                  </div>
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-sm`}>
                    <Icon />
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 font-display">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Featured skills */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">Latest Skills Near You</h2>
          <Link to="/browse" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View all &rarr;
          </Link>
        </div>
        <SkillGrid listings={featuredSkills} />
      </div>
    </div>
  )
}
