import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'

export function EmptyInbox() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-primary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-900 font-display">No messages yet</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
        Browse skills to start a conversation and arrange your first skill swap.
      </p>
      <div className="mt-6">
        <Link to="/browse">
          <Button variant="primary">Browse Skills</Button>
        </Link>
      </div>
    </div>
  )
}
