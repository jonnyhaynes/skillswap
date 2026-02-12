import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useMessages } from '@/hooks/useMessages'
import { useSwaps } from '@/hooks/useSwaps'
import { Avatar } from '@/components/ui/Avatar'
import { VerifiedBadge } from '@/components/profile/VerifiedBadge'

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
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const profileButtonRef = useRef<HTMLButtonElement>(null)
  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0
  const incomingSwapsCount = currentUser ? getIncomingSwaps(currentUser.id).length : 0

  const handleSignOut = async () => {
    setProfileMenuOpen(false)
    await signOut()
    navigate('/')
  }

  // Close profile menu on Escape key
  useEffect(() => {
    if (!profileMenuOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setProfileMenuOpen(false)
        profileButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [profileMenuOpen])

  // Filter nav links based on auth state
  const visibleNavLinks = NAV_LINKS.filter(
    (link) => !link.requiresAuth || currentUser
  )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/75 backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5" aria-label="SkillSwap home">
          <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#43c1a6" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="10" fill="url(#logo-grad)" />
            <path d="M10 18.5h7m0 0l-3-3m3 3l-3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 13.5h-7m0 0l3-3m-3 3l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          </svg>
          <span className="text-lg font-extrabold text-slate-900 font-display" aria-hidden="true">SkillSwap</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {visibleNavLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
                {link.to === '/swaps' && incomingSwapsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-1 text-xs font-bold text-white shadow-sm shadow-red-500/30">
                    <span className="sr-only">{incomingSwapsCount} pending</span>
                    <span aria-hidden="true">{incomingSwapsCount}</span>
                  </span>
                )}
                {link.to === '/messages' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-1 text-xs font-bold text-white shadow-sm shadow-red-500/30">
                    <span className="sr-only">{unreadCount} unread</span>
                    <span aria-hidden="true">{unreadCount}</span>
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right side: Post + Profile/Auth */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <Link
              to="/skills/new"
              className="hidden sm:inline-flex rounded-xl bg-primary-600 hover:bg-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
            >
              + Post a Skill
            </Link>
          )}

          {initialized && currentUser ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                ref={profileButtonRef}
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50 transition-colors"
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <div className="shrink-0 relative">
                  <div className="rounded-full p-0.5 bg-primary-500">
                    <div className="rounded-full p-0.5 bg-white">
                      <Avatar
                        src={currentUser.avatarUrl}
                        name={`${currentUser.firstName} ${currentUser.lastName}`}
                        size="sm"
                      />
                    </div>
                  </div>
                  {currentUser.isVerifiedNeighbour && (
                    <span className="absolute -bottom-0.5 -right-0.5">
                      <VerifiedBadge className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {currentUser.firstName}
                </span>
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-0 top-full mt-2 z-20 w-52 rounded-2xl bg-white/90 backdrop-blur-xl ring-1 ring-black/[0.06] py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.1)] animate-scale-in"
                    role="menu"
                    aria-label="User menu"
                  >
                    <Link
                      to={`/profile/${currentUser.id}`}
                      className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg mx-1.5 transition-colors"
                      onClick={() => setProfileMenuOpen(false)}
                      role="menuitem"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/my-listings"
                      className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg mx-1.5 transition-colors"
                      onClick={() => setProfileMenuOpen(false)}
                      role="menuitem"
                    >
                      My Listings
                    </Link>
                    <Link
                      to="/profile/edit"
                      className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg mx-1.5 transition-colors"
                      onClick={() => setProfileMenuOpen(false)}
                      role="menuitem"
                    >
                      Edit Profile
                    </Link>
                    <hr className="my-1.5 border-slate-100 mx-3" aria-hidden="true" />
                    <button
                      onClick={handleSignOut}
                      className="block w-[calc(100%-0.75rem)] mx-1.5 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      role="menuitem"
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
                className="hidden sm:inline-flex rounded-xl bg-primary-600 hover:bg-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
              >
                Sign up
              </Link>
            </div>
          ) : (
            // Loading placeholder
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" aria-hidden="true" />
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
        <nav className="md:hidden border-t border-slate-200/50 bg-white/75 backdrop-blur-2xl px-4 pb-4 pt-2 animate-fade-in" aria-label="Mobile navigation">
          {visibleNavLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
                {link.to === '/swaps' && incomingSwapsCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-1 text-xs font-bold text-white shadow-sm shadow-red-500/30">
                    <span className="sr-only">{incomingSwapsCount} pending</span>
                    <span aria-hidden="true">{incomingSwapsCount}</span>
                  </span>
                )}
                {link.to === '/messages' && unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-1 text-xs font-bold text-white shadow-sm shadow-red-500/30">
                    <span className="sr-only">{unreadCount} unread</span>
                    <span aria-hidden="true">{unreadCount}</span>
                  </span>
                )}
              </Link>
            )
          })}

          {currentUser ? (
            <>
              <Link
                to="/skills/new"
                className="mt-2 block rounded-xl bg-primary-600 hover:bg-primary-700 px-3 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-primary-500/20 transition-all duration-200"
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
                className="block rounded-xl bg-primary-600 hover:bg-primary-700 px-3 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-primary-500/20 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  )
}
