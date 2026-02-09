import { useState, useRef, useCallback, type KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (content: string) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const lineHeight = 24
    const maxHeight = lineHeight * 4
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [])

  const handleSend = () => {
    const trimmed = content.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setContent('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2.5 pt-3 border-t border-slate-200/80">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          adjustHeight()
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm leading-6 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 focus:bg-white disabled:opacity-50 disabled:bg-slate-50 transition-all duration-200"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !content.trim()}
        className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-[#43c1a6] to-[#6366f1] flex items-center justify-center text-white hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </div>
  )
}
