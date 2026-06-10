type Props = {
  from: number
  to: number
  count: number
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
}

const buttonClassName =
  "relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"

const disabledButtonClassName =
  "relative inline-flex cursor-not-allowed items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-400 ring-1 ring-inset ring-gray-200"

export const PaginationNav = ({
  from,
  to,
  count,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: Props) => {
  return (
    <nav
      aria-label="Seitennummerierung"
      className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
    >
      <div className="hidden sm:block">
        {count === 0 ? (
          <p className="text-sm text-gray-700">Keine Einträge</p>
        ) : (
          <p className="text-sm text-gray-700">
            Zeige <span className="font-medium">{from}</span> bis{" "}
            <span className="font-medium">{to}</span> von{" "}
            <span className="font-medium">{count}</span> Einträgen
          </p>
        )}
      </div>
      <div className="flex flex-1 justify-between sm:justify-end">
        {canGoPrevious ? (
          <button type="button" className={buttonClassName} onClick={onPrevious}>
            Zurück
          </button>
        ) : (
          <span className={disabledButtonClassName}>Zurück</span>
        )}
        {canGoNext ? (
          <button type="button" className={`${buttonClassName} ml-3`} onClick={onNext}>
            Weiter
          </button>
        ) : (
          <span className={`${disabledButtonClassName} ml-3`}>Weiter</span>
        )}
      </div>
    </nav>
  )
}
