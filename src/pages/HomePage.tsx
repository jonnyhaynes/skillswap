import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { SkillListing } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useSkills } from '@/hooks/useSkills'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useSeo } from '@/hooks/useSeo'
import { graph, organizationSchema, webSiteSchema } from '@/lib/structuredData'
import { SkillGrid } from '@/components/skills/SkillGrid'

function SearchIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
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

const STEPS = [
  {
    step: '1',
    title: 'Choose a Skill',
    desc: 'Post what you can teach or browse what others are offering near you.',
    icon: ClipboardIcon,
    gradient: 'from-[#43c1a6] to-[#6366f1]',
    bg: 'bg-emerald-50/60',
  },
  {
    step: '2',
    title: 'Match with a Person',
    desc: 'Find someone whose skills complement yours and propose a swap.',
    icon: PeopleIcon,
    gradient: 'from-[#f472b6] to-[#fb923c]',
    bg: 'bg-rose-50/60',
  },
  {
    step: '3',
    title: 'Swap Time, Not Money',
    desc: 'Meet up, learn from each other, and leave reviews when you\'re done.',
    icon: SparkleIcon,
    gradient: 'from-[#a78bfa] to-[#38bdf8]',
    bg: 'bg-violet-50/60',
  },
]

function FeaturedSkills({ listings }: { listings: SkillListing[] }) {
  const { ref, revealed } = useScrollReveal(0.1)

  return (
    <div ref={ref}>
      <div className={`flex items-center justify-between mb-8 scroll-reveal${revealed ? ' revealed' : ''}`}>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">Latest Skills Near You</h2>
        <Link to="/browse" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
          View all &rarr;
        </Link>
      </div>
      <SkillGrid listings={listings} staggerReveal={revealed} />
    </div>
  )
}

function HowItWorks() {
  const { ref, revealed } = useScrollReveal(0.2)

  return (
    <div ref={ref}>
      <div className="text-center mb-10">
        <h2 className={`text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight scroll-reveal${revealed ? ' revealed' : ''}`}>
          How SkillSwap Works
        </h2>
        <p className={`mt-2 text-slate-500 text-sm scroll-reveal${revealed ? ' revealed' : ''}`} style={{ animationDelay: '0.1s' }}>
          Three simple steps to start swapping skills
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 mt-4">
        {STEPS.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={item.step}
              className={`${item.bg} rounded-2xl pt-12 pb-8 px-8 relative ring-1 ring-black/[0.02] scroll-reveal${revealed ? ' revealed' : ''}`}
              style={{ animationDelay: `${0.15 + index * 0.12}s` }}
            >
              {/* Overlapping icon badge */}
              <div className={`absolute -top-5 left-8 w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-lg shadow-black/10 ring-4 ring-[#f8fafc]`}>
                <Icon />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display mb-3">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function HomePage() {
  const { currentUser } = useAuth()
  const { listings } = useSkills()
  const navigate = useNavigate()
  const [heroSearch, setHeroSearch] = useState('')

  useSeo({
    canonical: '/',
    jsonLd: graph(organizationSchema(), webSiteSchema()),
  })

  const featuredSkills = useMemo(() => {
    return listings
      .filter((l) => l.userId !== currentUser?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
  }, [listings, currentUser])

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (heroSearch.trim()) {
      navigate(`/browse?search=${encodeURIComponent(heroSearch.trim())}`)
    } else {
      navigate('/browse')
    }
  }

  return (
    <div className="space-y-16">
      {/* Hero with integrated stats */}
      <div className="hero-mesh relative overflow-hidden rounded-3xl">
        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Mesh gradient blobs — vivid + animated */}
        <div className="absolute -top-24 -left-24 w-[520px] h-[520px] bg-gradient-to-br from-emerald-400/45 to-transparent rounded-full blur-3xl animate-[drift-a_18s_ease-in-out_infinite]" />
        <div className="absolute -bottom-20 -right-20 w-[420px] h-[420px] bg-gradient-to-tl from-indigo-500/35 to-transparent rounded-full blur-3xl animate-[drift-b_22s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 right-[10%] w-56 h-56 bg-gradient-to-br from-violet-400/25 to-transparent rounded-full blur-2xl animate-[drift-a_28s_ease-in-out_infinite] [animation-delay:1s]" />
        <div className="absolute top-[15%] left-[20%] w-44 h-44 bg-gradient-to-tr from-sky-400/18 to-transparent rounded-full blur-xl animate-[drift-b_32s_ease-in-out_infinite] [animation-delay:2s]" />
        <div className="absolute bottom-[8%] left-[38%] w-72 h-72 bg-gradient-to-tr from-teal-300/18 to-transparent rounded-full blur-2xl animate-[drift-a_24s_ease-in-out_infinite] [animation-delay:4s]" />

        {/* Accent ring decorations — breathing */}
        <div className="absolute top-16 right-[8%] w-24 h-24 rounded-full border border-white/[0.1] hidden sm:block ring-breathe" />
        <div className="absolute top-10 right-[12%] w-10 h-10 rounded-full border border-white/[0.08] hidden sm:block ring-breathe [animation-delay:1.5s]" />
        <div className="absolute bottom-28 left-[6%] w-16 h-16 rounded-full border border-white/[0.08] hidden sm:block ring-breathe [animation-delay:3s]" />
        <div className="absolute top-[40%] left-[3%] w-8 h-8 rounded-full border border-white/[0.06] hidden xl:block ring-breathe [animation-delay:2s]" />

        {/* Floating decorative glyphs */}
        <div className="absolute top-20 left-[15%] text-white/[0.09] text-4xl font-light hidden lg:block select-none float-glyph" aria-hidden="true">+</div>
        <div className="absolute bottom-32 right-[18%] text-white/[0.07] text-2xl font-light hidden lg:block select-none float-glyph [animation-delay:2.5s]" aria-hidden="true">+</div>
        <div className="absolute top-1/2 left-[5%] text-white/[0.05] text-xl font-light hidden xl:block select-none float-glyph [animation-delay:1.2s]" aria-hidden="true">×</div>
        <div className="absolute top-[30%] right-[4%] text-white/[0.05] text-3xl font-light hidden xl:block select-none float-glyph [animation-delay:3.8s]" aria-hidden="true">◦</div>

        {/* Hero content */}
        <div className="relative z-10 text-center pt-16 sm:pt-24 px-6 pb-8">
          {/* Live indicator badge — logged-out visitors only */}
          {!currentUser && (
            <div className="hero-enter mb-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.08] ring-1 ring-white/[0.15] text-white/70 text-xs font-medium tracking-wide" style={{ animationDelay: '0s' }}>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Skills available in your neighbourhood
            </div>
          )}

          {currentUser ? (
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display leading-[1.1] tracking-tight hero-enter" style={{ animationDelay: '0.05s' }}>
              Welcome back, {currentUser.firstName}!
            </h1>
          ) : (
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display leading-[1.1] tracking-tight">
              <span className="block hero-enter" style={{ animationDelay: '0.1s' }}>Learn what you need.</span>
              <span className="block hero-enter" style={{ animationDelay: '0.26s' }}>
                <span className="text-gradient-flow">Teach what you know.</span>
              </span>
            </h1>
          )}

          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed hero-enter" style={{ animationDelay: currentUser ? '0.2s' : '0.42s' }}>
            Swap skills with your neighbours — no money, just knowledge and time.
          </p>

          {/* Floating glass search bar */}
          <form onSubmit={handleHeroSearch} className="mt-10 max-w-xl mx-auto hero-enter" role="search" aria-label="Search skills" style={{ animationDelay: currentUser ? '0.35s' : '0.58s' }}>
            <label htmlFor="hero-search" className="sr-only">Search skills</label>
            <div className="glass-dark rounded-2xl flex items-center gap-3 px-5 py-3.5 ring-1 ring-white/[0.12] shadow-xl shadow-black/10">
              <SearchIcon className="w-5 h-5 text-white/40 shrink-0" />
              <input
                id="hero-search"
                type="search"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Photography, Excel, Guitar..."
                className="flex-1 bg-transparent text-white placeholder-white/50 text-sm focus:outline-none py-1"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-white px-5 py-2 text-sm font-bold text-primary-700 hover:bg-white/90 transition-all shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 hero-enter" style={{ animationDelay: currentUser ? '0.5s' : '0.74s' }}>
            {currentUser ? (
              <>
                <Link
                  to="/skills/new"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-bold text-primary-700 hover:bg-white/90 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15"
                >
                  Offer a Skill
                </Link>
                <Link
                  to="/browse"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/20 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Find a Skill
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/browse"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-bold text-primary-700 hover:bg-white/90 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15"
                >
                  Find a Skill
                </Link>
                <Link
                  to="/skills/new"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/20 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Offer a Skill
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* How it works */}
      <HowItWorks />

      {/* Featured skills */}
      <FeaturedSkills listings={featuredSkills} />
    </div>
  )
}
