import { Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

export function Footer() {
  const { currentUser } = useAuth()

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* CTA Banner */}
      {!currentUser && (
        <div className="border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl font-bold text-white font-display">
              Ready to share your skills?
            </h3>
            <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Join your neighbourhood and start swapping skills with people near you.
            </p>
            <Link
              to="/signup"
              className="mt-6 inline-flex items-center rounded-xl bg-gradient-to-r from-[#43c1a6] to-[#6366f1] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:brightness-105 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      {/* Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5">
              <svg className="h-7 w-7" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="footer-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#43c1a6" />
                    <stop offset="1" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="10" fill="url(#footer-logo-grad)" />
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

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} SkillSwap. A <a href="https://www.colouringcode.com" target="_blank" rel="noopener noreferrer" className="hover:underline focus:underline">Colouring Code</a> design and build. Made in Rotherham.
          </p>
        </div>
      </div>
    </footer>
  )
}
