interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search skills...',
}: SearchBarProps) {
  return (
    <div className="relative w-full group/search" role="search">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          className="w-5 h-5 text-slate-400 group-focus-within/search:text-primary-500 transition-colors duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <label htmlFor="skill-search" className="sr-only">
        Search skills
      </label>
      <input
        id="skill-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 rounded-xl py-3.5 pl-10 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:shadow-[0_0_0_4px_rgba(33,166,141,0.08)] transition-all duration-200"
      />
    </div>
  );
}
