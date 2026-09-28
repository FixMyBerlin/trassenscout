import { secondaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { SpinnerIcon } from "@/src/components/core/components/Spinner"

type Props = {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  loadedCount: number
}

export function LoadMoreButton({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  loadedCount,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <p className="text-sm text-gray-500">{loadedCount} Einträge geladen</p>
      {hasNextPage ? (
        <button
          type="button"
          className={secondaryButtonClassName}
          onClick={onLoadMore}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? (
            <>
              <SpinnerIcon size="5" />
              Wird geladen…
            </>
          ) : (
            "Mehr laden"
          )}
        </button>
      ) : (
        <p className="text-sm text-gray-500">Alle Einträge geladen</p>
      )}
    </div>
  )
}
