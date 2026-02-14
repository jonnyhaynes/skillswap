import { useState, useEffect, useRef, useCallback } from 'react'
import { searchPlaces, type PlaceResult } from '@/services/osNames'
import { getNeighbourhoods } from '@/services/neighbourhoods'
import { cn } from '@/utils/cn'

interface NeighbourhoodTypeaheadProps {
  value: string
  onChange: (place: PlaceResult | null) => void
  label?: string
  required?: boolean
  id?: string
  error?: string
}

export function NeighbourhoodTypeahead({
  value,
  onChange,
  label = 'Neighbourhood',
  required = false,
  id,
  error,
}: NeighbourhoodTypeaheadProps) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<PlaceResult[]>([])
  const [fallbackResults, setFallbackResults] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [hasApiKey] = useState(() => !!import.meta.env.VITE_OS_NAMES_API_KEY)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
  const errorId = error ? `${inputId}-error` : undefined

  // Load fallback neighbourhoods list once (used when API key is missing or API fails)
  useEffect(() => {
    getNeighbourhoods().then(setFallbackResults)
  }, [])

  // Sync query with external value changes (e.g. form reset)
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const doSearch = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    if (!hasApiKey) {
      // Fallback: filter static list
      const filtered = fallbackResults
        .filter((n) => n.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 10)
      setResults(filtered.map((n) => ({ name: n, localType: '', county: '' })))
      setIsOpen(filtered.length > 0)
      setActiveIndex(-1)
      return
    }

    setLoading(true)
    try {
      const places = await searchPlaces(term)
      setResults(places.slice(0, 10))
      setIsOpen(places.length > 0)
      setActiveIndex(-1)
    } catch {
      // API failed — fall back to filtering the DB/static list
      const filtered = fallbackResults
        .filter((n) => n.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 10)
      setResults(filtered.map((n) => ({ name: n, localType: '', county: '' })))
      setIsOpen(filtered.length > 0)
      setActiveIndex(-1)
    } finally {
      setLoading(false)
    }
  }, [hasApiKey, fallbackResults])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)

    // Clear selection if user edits after selecting
    if (value && val !== value) {
      onChange(null)
    }

    // Debounce the search
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 300)
  }

  function selectPlace(place: PlaceResult) {
    setQuery(place.name)
    onChange(place)
    setIsOpen(false)
    setResults([])
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < results.length) {
          selectPlace(results[activeIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {label && label !== '' && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={`${inputId}-listbox`}
        aria-activedescendant={activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (query.trim().length >= 2 && results.length > 0) {
            setIsOpen(true)
          }
        }}
        placeholder="Start typing a place name…"
        autoComplete="off"
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none hover:border-slate-300 placeholder:text-slate-400',
          error && 'border-red-600'
        )}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-[38px]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary-500" />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
        >
          {results.map((place, index) => (
            <li
              key={`${place.name}-${index}`}
              id={`${inputId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault()
                selectPlace(place)
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                'cursor-pointer px-4 py-2.5 text-sm transition-colors',
                index === activeIndex
                  ? 'bg-primary-50 text-primary-900'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              <span className="font-medium">{place.name}</span>
              {(place.localType || place.county) && (
                <span className="ml-2 text-xs text-slate-400">
                  {[place.localType, place.county].filter(Boolean).join(', ')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p id={errorId} className="text-red-600 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
