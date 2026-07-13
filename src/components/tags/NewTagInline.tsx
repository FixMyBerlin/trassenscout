import { useState } from "react"
import { twJoin } from "tailwind-merge"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"

type Props = {
  onCreate: (title: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  inputId?: string
}

export function NewTagInline({
  onCreate,
  disabled = false,
  placeholder = "Neues Tag",
  maxLength = 35,
  inputId = "newTag",
}: Props) {
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle || disabled || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onCreate(trimmedTitle)
      setTitle("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-full items-end gap-2">
      <div className="grow">
        <label htmlFor={inputId} className="sr-only">
          {placeholder}
        </label>
        <input
          id={inputId}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              void handleCreate()
            }
          }}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
          className="block w-full grow appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"
        />
      </div>
      <button
        type="button"
        onClick={() => void handleCreate()}
        disabled={disabled || isSubmitting}
        className={twJoin(primaryButtonClassName, "shrink-0 px-3! py-2!")}
      >
        Hinzufügen
      </button>
    </div>
  )
}
