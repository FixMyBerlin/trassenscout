import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid"

type Props = {
  name: string
  value: string
  placeholder: string
  ariaLabel: string
  onChange: (value: string) => void
}

export function AdminSearchField({ name, value, placeholder, ariaLabel, onChange }: Props) {
  return (
    <div className="relative w-44 min-w-0">
      <MagnifyingGlassIcon
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400"
        aria-hidden
      />
      <input
        type="text"
        role="searchbox"
        name={name}
        value={value}
        aria-label={ariaLabel}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="block w-full appearance-none rounded-md border border-gray-300 py-1.5 pr-7 pl-8 text-xs placeholder-gray-400 shadow-xs focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden"
      />
      {value ? (
        <button
          type="button"
          aria-label={`${ariaLabel} zurücksetzen`}
          className="absolute top-1/2 right-1.5 -translate-y-1/2 cursor-pointer rounded p-0.5 text-gray-400 hover:text-gray-600"
          onClick={() => onChange("")}
        >
          <XMarkIcon className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  )
}
