import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

export function UserSwitcher() {
  const { currentUser, allUsers, switchUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="fixed bottom-4 left-4 z-50">
      {isOpen && (
        <div className="mb-2 bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Switch User
            </p>
          </div>
          <ul className="py-1 max-h-80 overflow-y-auto">
            {allUsers.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => {
                    switchUser(user.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm transition-colors',
                    user.id === currentUser?.id
                      ? 'bg-primary-500/20 text-primary-300'
                      : 'text-slate-300 hover:bg-slate-700'
                  )}
                >
                  {user.firstName} {user.lastName}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg px-3 py-2 hover:bg-slate-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
        </svg>
        <span>Switch User</span>
      </button>
    </div>
  )
}
