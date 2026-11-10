import { XMarkIcon } from "@heroicons/react/20/solid"
import { type ReactNode, useEffect, useState } from "react"
import { twJoin } from "tailwind-merge"
import { linkStyles } from "@/src/components/core/components/links/styles"

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  name?: string
  formId?: string
  children?: ReactNode
  actions?: ReactNode
  debounceMs?: number
  singleLine?: boolean
  resetLabel?: string
  onSubmit?: (value: string) => void
} & ({ onReset: () => void; hasFilter: boolean } | { onReset?: never; hasFilter?: never })

export function PageHeaderSearchFilter({
  value,
  onChange,
  onReset,
  hasFilter,
  placeholder = "Nach Suchwort filtern",
  hint,
  name = "searchterm",
  formId,
  children,
  actions,
  debounceMs = 300,
  singleLine = false,
  resetLabel = "Filter zurücksetzen",
  onSubmit,
}: Props) {
  const [draft, setDraft] = useState<{
    baseValue: string
    value: string
    committedValue?: string
  } | null>(null)
  if (draft && draft.baseValue !== value) {
    const typedOn = draft.committedValue === value && draft.value !== value
    setDraft(typedOn ? { ...draft, baseValue: value } : null)
  }
  const draftValue = draft?.baseValue === value ? draft.value : value

  useEffect(
    function commitDebouncedSearchDraft() {
      if (!draft || draft.baseValue !== value) return
      if (draft.value === value || draft.value === draft.committedValue) return

      const timeout = setTimeout(() => {
        setDraft({ ...draft, committedValue: draft.value })
        onChange(draft.value)
      }, debounceMs)
      return () => clearTimeout(timeout)
    },
    [debounceMs, draft, onChange, value],
  )

  const handleReset = () => {
    setDraft(null)
    onReset?.()
  }

  return (
    <div className="min-w-0">
      <form
        id={formId}
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit?.(draftValue)
        }}
        className={twJoin("flex items-center gap-3", !singleLine && "flex-wrap")}
      >
        <div className={singleLine ? "w-[450px] max-w-full" : "w-full sm:w-[450px]"}>
          <input
            type="text"
            name={name}
            value={draftValue}
            onChange={(e) =>
              setDraft((current) => ({ ...current, baseValue: value, value: e.target.value }))
            }
            placeholder={placeholder}
            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"
          />
        </div>
        {children}
        {onReset && (hasFilter || draftValue) ? (
          <button
            type="button"
            aria-label={resetLabel}
            className={twJoin(linkStyles, "flex shrink-0 items-center gap-2 whitespace-nowrap")}
            onClick={handleReset}
          >
            <XMarkIcon className="size-4" aria-hidden="true" />
            {/* A single-line search shares its row with other actions, so only the × shows below xl. */}
            <span className={singleLine ? "hidden xl:inline" : undefined}>{resetLabel}</span>
          </button>
        ) : null}
        {actions}
      </form>
      {hint ? <p className="mt-2 text-sm text-gray-500">{hint}</p> : null}
    </div>
  )
}
