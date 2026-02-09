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
  { label: 'Skills Available', key: 'offered' as const, icon: TargetIcon, iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
  { label: 'Skills Wanted', key: 'wanted' as const, icon: SearchIcon, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Total Listings', key: 'total' as const, icon: ListIcon, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { label: 'Categories', key: 'categories' as const, icon: GridIcon, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
]

function AnimatedStat({ value, label, icon: Icon, iconBg, iconColor, isLast }: { value: number | string; label: string; icon: React.ComponentType<{ className?: string }>; iconBg: string; iconColor: string; isLast: boolean }) {
  const numericValue = typeof value === 'number' ? value : 0
  const isLoading = typeof value === 'string'
  const { count, ref } = useCountUp(numericValue)

  return (
    <div ref={ref} className={`px-5 sm:px-6 py-5 ${!isLast ? 'border-r border-slate-100' : ''}`}>
      {/* Icon */}
      <div className="mb-3">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
        </div>
      </div>
      {/* Number */}
      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tabular-nums leading-none">
        {isLoading ? '...' : count}
      </div>
      {/* Label */}
      <div className="text-xs text-slate-400 font-medium mt-1.5">{label}</div>
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
      <div>
        {/* Hero banner */}
        <div className="hero-mesh relative overflow-hidden rounded-2xl pb-16 sm:pb-20">
          {/* Dot grid pattern */}
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          {/* Mesh gradient blobs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-teal-400/25 to-transparent rounded-full blur-3xl animate-[drift_20s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-tl from-cyan-400/20 to-transparent rounded-full blur-3xl animate-[drift_25s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/3 right-[10%] w-48 h-48 bg-gradient-to-br from-emerald-400/15 to-transparent rounded-full blur-2xl" />
          <div className="absolute top-[15%] left-[20%] w-32 h-32 bg-gradient-to-tr from-sky-400/10 to-transparent rounded-full blur-xl" />

          {/* Accent ring decorations */}
          <div className="absolute top-16 right-[8%] w-24 h-24 rounded-full border border-white/[0.08] hidden sm:block" />
          <div className="absolute top-10 right-[12%] w-10 h-10 rounded-full border border-white/[0.06] hidden sm:block" />
          <div className="absolute bottom-28 left-[6%] w-16 h-16 rounded-full border border-white/[0.06] hidden sm:block" />

          {/* Floating plus shapes */}
          <div className="absolute top-20 left-[15%] text-white/[0.06] text-4xl font-light hidden lg:block select-none">+</div>
          <div className="absolute bottom-32 right-[18%] text-white/[0.05] text-2xl font-light hidden lg:block select-none">+</div>

          {/* Hero content */}
          <div className="relative z-10 text-center pt-14 sm:pt-20 px-6 pb-8">
            {currentUser ? (
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display leading-tight">
                Welcome back, {currentUser.firstName}!
              </h1>
            ) : (
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display leading-tight">
                Learn what you need.
                <br />
                <span className="bg-gradient-to-r from-teal-200 to-cyan-200 bg-clip-text text-transparent">Teach what you know.</span>
              </h1>
            )}
            <p className="mt-5 text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
              Swap skills with your neighbours — no money, just knowledge.
            </p>

            {/* Floating glass search bar */}
            <form onSubmit={handleHeroSearch} className="mt-8 max-w-xl mx-auto">
              <div className="glass-dark rounded-2xl flex items-center gap-3 px-5 py-3 ring-1 ring-white/[0.1]">
                <SearchIcon className="w-5 h-5 text-white/40 shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Photography, Excel, Guitar..."
                  className="flex-1 bg-transparent text-white placeholder-white/35 text-sm focus:outline-none"
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
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-semibold text-primary-700 hover:bg-white/90 transition-colors shadow-lg shadow-black/10"
                  >
                    Offer a Skill
                  </Link>
                  <Link
                    to="/browse"
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/25 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    Find a Skill
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/browse"
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-semibold text-primary-700 hover:bg-white/90 transition-colors shadow-lg shadow-black/10"
                  >
                    Find a Skill
                  </Link>
                  <Link
                    to="/skills/new"
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/25 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    Offer a Skill
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats row — floating overlap */}
        <div className="relative z-10 -mt-10 sm:-mt-12 mx-2 sm:mx-6 bg-white rounded-2xl shadow-lg shadow-black/[0.04] ring-1 ring-slate-100">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {STATS_CONFIG.map((stat, i) => (
              <AnimatedStat key={stat.label} value={statValues[stat.key]} label={stat.label} icon={stat.icon} iconBg={stat.iconBg} iconColor={stat.iconColor} isLast={i === STATS_CONFIG.length - 1} />
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
