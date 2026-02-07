import { useMemo } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useSkills } from '@/hooks/useSkills'
import { SkillGrid } from '@/components/skills/SkillGrid'
import { Card } from '@/components/ui/Card'

export function HomePage() {
  const { currentUser } = useAuth()
  const { listings, loading } = useSkills()

  const featuredSkills = useMemo(() => {
    return listings
      .filter((l) => l.userId !== currentUser?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
  }, [listings, currentUser])

  const offeredCount = listings.filter((l) => l.listingType === 'offered').length
  const wantedCount = listings.filter((l) => l.listingType === 'wanted').length

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          {currentUser ? `Welcome back, ${currentUser.firstName}!` : 'Welcome to SkillSwap!'}
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
          Swap skills with your neighbours. Teach what you know, learn what you love.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {currentUser ? (
            <>
              <Link
                to="/skills/new"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-primary-500 px-6 py-3 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
              >
                + Post a Skill
              </Link>
              <Link
                to="/browse"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Browse Skills
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-primary-500 px-6 py-3 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/browse"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Browse Skills
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Skills Available', value: loading ? '...' : offeredCount, emoji: '🎯' },
          { label: 'Skills Wanted', value: loading ? '...' : wantedCount, emoji: '🔍' },
          { label: 'Total Listings', value: loading ? '...' : listings.length, emoji: '📋' },
          { label: 'Categories', value: 12, emoji: '📂' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 text-center">
            <div className="text-2xl mb-1">{stat.emoji}</div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">How SkillSwap Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'List Your Skills', desc: 'Post what you can teach and what you want to learn.', emoji: '📝' },
            { step: '2', title: 'Find a Match', desc: 'Browse listings from neighbours near you and propose a swap.', emoji: '🤝' },
            { step: '3', title: 'Start Swapping', desc: 'Meet up, learn from each other, and leave reviews.', emoji: '🌟' },
          ].map((item) => (
            <Card key={item.step} className="p-6">
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured skills */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Latest Skills Near You</h2>
          <Link to="/browse" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View all →
          </Link>
        </div>
        <SkillGrid listings={featuredSkills} />
      </div>
    </div>
  )
}
