import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useMessages } from '@/hooks/useMessages'
import { useSwaps } from '@/hooks/useSwaps'
import { Avatar } from '@/components/ui/Avatar'

const NAV_LINKS = [
  { to: '/browse', label: 'Browse' },
  { to: '/swaps', label: 'My Swaps', requiresAuth: true },
  { to: '/messages', label: 'Messages', requiresAuth: true },
]

export function Header() {
  const { currentUser, signOut, initialized } = useAuth()
  const { getUnreadCount } = useMessages()
  const { getIncomingSwaps } = useSwaps()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0
  const incomingSwapsCount = currentUser ? getIncomingSwaps(currentUser.id).length : 0

  const handleSignOut = async () => {
    setProfileMenuOpen(false)
    await signOut()
    navigate('/')
  }

  // Filter nav links based on auth state
  const visibleNavLinks = NAV_LINKS.filter(
    (link) => !link.requiresAuth || currentUser
  )

  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#14b8a6" />
            <path d="M10 18.5h7m0 0l-3-3m3 3l-3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 13.5h-7m0 0l3-3m-3 3l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          </svg>
          <span className="text-lg font-extrabold text-slate-900 font-display">SkillSwap</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {visibleNavLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname.startsWith(link.to)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.label}
              {link.to === '/swaps' && incomingSwapsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {incomingSwapsCount}
                </span>
              )}
              {link.to === '/messages' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right side: Post + Profile/Auth */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <Link
              to="/skills/new"
              className="hidden sm:inline-flex rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all duration-200"
            >
              + Post a Skill
            </Link>
          )}

          {initialized && currentUser ? (
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
                  <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-xl glass py-1 shadow-lg">
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
                    <hr className="my-1 border-slate-200" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : initialized ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="hidden sm:inline-flex rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all duration-200"
              >
                Sign up
              </Link>
            </div>
          ) : (
            // Loading placeholder
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
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
        <div className="md:hidden border-t border-white/20 bg-white/80 backdrop-blur-xl px-4 pb-4 pt-2">
          {visibleNavLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                location.pathname.startsWith(link.to)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
              {link.to === '/swaps' && incomingSwapsCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {incomingSwapsCount}
                </span>
              )}
              {link.to === '/messages' && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}

          {currentUser ? (
            <>
              <Link
                to="/skills/new"
                className="mt-2 block rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6] px-3 py-2 text-center text-sm font-medium text-white hover:opacity-90 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                + Post a Skill
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleSignOut()
                }}
                className="mt-2 w-full rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 text-left"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              <Link
                to="/login"
                className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="block rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6] px-3 py-2 text-center text-sm font-medium text-white hover:opacity-90 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
