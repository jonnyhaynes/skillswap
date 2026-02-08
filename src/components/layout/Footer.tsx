import { Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

export function Footer() {
  const { currentUser } = useAuth()

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* CTA Banner */}
      {!currentUser && (
        <div className="border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 text-center">
            <h3 className="text-xl font-bold text-white font-display">
              Ready to share your skills?
            </h3>
            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
              Join your neighbourhood and start swapping skills with people near you.
            </p>
            <Link
              to="/signup"
              className="mt-4 inline-flex items-center rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      {/* Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <svg className="h-7 w-7" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#14b8a6" />
                <path d="M10 18.5h7m0 0l-3-3m3 3l-3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 13.5h-7m0 0l3-3m-3 3l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
              </svg>
              <span className="text-base font-extrabold text-white font-display">SkillSwap</span>
            </div>
            <p className="mt-3 text-sm text-slate-400 max-w-xs">
              Connecting neighbours through skills. Teach what you know, learn what you love.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Explore</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/browse" className="text-slate-400 hover:text-white transition-colors">Browse Skills</Link>
              <Link to="/skills/new" className="text-slate-400 hover:text-white transition-colors">Post a Skill</Link>
            </nav>
          </div>

          {/* Tagline */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">About</h4>
            <p className="text-sm text-slate-400">
              SkillSwap is a neighbourhood skill exchange platform. Share your expertise, discover new talents, and build community connections.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center">
          <p className="text-xs text-slate-500">
            Neighbourhood Skill Exchange
          </p>
        </div>
      </div>
    </footer>
  )
}
