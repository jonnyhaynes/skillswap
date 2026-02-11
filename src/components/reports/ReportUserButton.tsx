import { useState } from 'react'
import { ReportUserModal } from './ReportUserModal'

interface ReportUserButtonProps {
  reportedUserId: string
  reportedUserName: string
  evidenceSwapId?: string
}

export function ReportUserButton({
  reportedUserId,
  reportedUserName,
  evidenceSwapId,
}: ReportUserButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
        aria-label={`Report ${reportedUserName}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
          />
        </svg>
        Report
      </button>

      <ReportUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reportedUserId={reportedUserId}
        reportedUserName={reportedUserName}
        evidenceSwapId={evidenceSwapId}
      />
    </>
  )
}
