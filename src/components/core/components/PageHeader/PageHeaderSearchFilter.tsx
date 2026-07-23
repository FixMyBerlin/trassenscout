import { MagnifyingGlassIcon } from "@heroicons/react/16/solid"
import { XMarkIcon } from "@heroicons/react/20/solid"
import { twJoin } from "tailwind-merge"
import { linkStyles } from "@/src/components/core/components/links/styles"

type Props = {
  value: string
  onChange: (value: string) => void
  onReset: () => void
  placeholder?: string
  hint?: string
  name?: string
  formId?: string
}

export function PageHeaderSearchFilter({
  value,
  onChange,
  onReset,
  placeholder = "Nach Suchwort filtern",
  hint,
  name = "searchterm",
  formId,
}: Props) {
  return (
    <div>
      <form
        id={formId}
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="w-[450px] max-w-full">
          <input
            type="text"
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"
          />
        </div>
        <button type="submit" className="shrink-0">
          <MagnifyingGlassIcon className="h-9 w-9 rounded-md bg-blue-500 p-2 text-white hover:bg-blue-800" />
        </button>
        <button
          type="button"
          className={twJoin(linkStyles, "flex items-center gap-2")}
          onClick={onReset}
        >
          <XMarkIcon className="size-4" />
          <span>Filter zurücksetzen</span>
        </button>
      </form>
      {hint ? <p className="mt-2 text-sm text-gray-500">{hint}</p> : null}
    </div>
  )
}
