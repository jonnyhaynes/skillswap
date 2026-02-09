import { Link, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useMessages } from '@/hooks/useMessages'
import { cn } from '@/utils/cn'

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    exact: true,
  },
  {
    to: '/browse',
    label: 'Browse',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    to: '/swaps',
    label: 'Swaps',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    to: '/messages',
    label: 'Messages',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    isDynamic: true,
  },
]

export function MobileNav() {
  const location = useLocation()
  const { currentUser } = useAuth()
  const { getUnreadCount } = useMessages()
  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to
    return location.pathname.startsWith(to)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/20 bg-white/80 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {NAV_ITEMS.map((item) => {
          const to = item.isDynamic && currentUser
            ? `/profile/${currentUser.id}`
            : item.to
          const active = isActive(to, item.exact)

          return (
            <Link
              key={item.label}
              to={to}
              className={cn(
                'relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors',
                active
                  ? 'text-primary-600'
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              {item.icon}
              {item.to === '/messages' && unreadCount > 0 && (
                <span className="absolute top-0.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
