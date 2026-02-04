import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-6xl font-bold text-slate-300">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-slate-900">Page not found</h2>
      <p className="mt-2 text-slate-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
      >
        Go home
      </Link>
    </div>
  )
}
