import { Link } from 'react-router'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary-500 text-white text-xs font-bold">
              SS
            </div>
            <span className="text-sm font-semibold text-slate-900">SkillSwap</span>
          </div>
          <nav className="flex gap-6 text-sm text-slate-500">
            <Link to="/browse" className="hover:text-slate-700 transition-colors">Browse Skills</Link>
            <Link to="/skills/new" className="hover:text-slate-700 transition-colors">Post a Skill</Link>
          </nav>
          <p className="text-xs text-slate-400">
            Connecting neighbours through skills
          </p>
        </div>
      </div>
    </footer>
  )
}
