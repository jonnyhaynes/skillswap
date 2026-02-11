interface VerifiedBadgeProps {
  className?: string
}

export function VerifiedBadge({ className = 'w-4 h-4' }: VerifiedBadgeProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={`${className} inline-block`}
      role="img"
      aria-label="Verified Neighbour"
    >
      <title>Verified Neighbour</title>
      {/* Shield shape with white stroke */}
      <path
        d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Z"
        fill="currentColor"
        stroke="white"
        strokeWidth={1.5}
        className="text-primary-500"
      />
      {/* Checkmark filled white */}
      <path
        d="M16.28 9.058a.75.75 0 0 0-1.17-.898l-3.96 5.142L8.97 11.12a.75.75 0 1 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.14-.094l4.73-5.528Z"
        fill="white"
      />
    </svg>
  )
}
