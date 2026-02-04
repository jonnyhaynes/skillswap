import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'

const NAV_LINKS = [
  { to: '/browse', label: 'Browse' },
  { to: '/swaps', label: 'My Swaps' },
  { to: '/messages', label: 'Messages' },
]

export function Header() {
  const { currentUser } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white font-bold text-sm">
            SS
          </div>
          <span className="text-lg font-bold text-slate-900">SkillSwap</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname.startsWith(link.to)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: Post + Profile */}
        <div className="flex items-center gap-3">
          <Link
            to="/skills/new"
            className="hidden sm:inline-flex rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            + Post a Skill
          </Link>

          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50 transition-colors"
              >
                <Avatar
                  src={currentUser.avatarUrl}
                  name={`${currentUser.firstName} ${currentUser.lastName}`}
                  size="sm"
                />
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {currentUser.firstName}
                </span>
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    <Link
                      to={`/profile/${currentUser.id}`}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/my-listings"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      My Listings
                    </Link>
                    <Link
                      to="/profile/edit"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Edit Profile
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pb-4 pt-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                location.pathname.startsWith(link.to)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/skills/new"
            className="mt-2 block rounded-lg bg-primary-500 px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            + Post a Skill
          </Link>
        </div>
      )}
    </header>
  )
}
