import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'

export function EmptyInbox() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-slate-300 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900">No messages yet</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">
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
