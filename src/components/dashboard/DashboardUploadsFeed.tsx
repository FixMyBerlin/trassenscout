import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import { Notice } from "@/src/components/core/components/Notice/Notice"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { Spinner } from "@/src/components/core/components/Spinner"
import { FilteredZeroCase } from "@/src/components/core/components/text/FilteredZeroCase"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { LoadMoreButton } from "@/src/components/core/pagination/LoadMoreButton"
import { UploadTable } from "@/src/components/uploads/UploadTable"
import { myUploadsInfiniteQueryOptions } from "@/src/server/uploads/uploadsQueryOptions"

type Props = {
  projectSlug?: string
  searchterm?: string
  tag?: string
  isFiltered: boolean
  onResetFilters: () => void
  onTagClick: (tag: string) => void
}

export function DashboardUploadsFeed({
  projectSlug,
  searchterm,
  tag,
  isFiltered,
  onResetFilters,
  onTagClick,
}: Props) {
  const { data, isError, isPlaceholderData, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery({
      ...myUploadsInfiniteQueryOptions({ projectSlug, searchterm, tag }),
      placeholderData: keepPreviousData,
    })

  if (!data) {
    return isError ? (
      <div className={pageContentPaddingClassName}>
        <Notice type="error" title="Die Dokumente konnten nicht geladen werden.">
          <p>Bitte laden Sie die Seite neu.</p>
        </Notice>
      </div>
    ) : (
      <Spinner page />
    )
  }

  const uploads = data.pages.flatMap((page) => page.uploads)
  // After a reset, the old "0 Ergebnisse" stays until the new list arrives.
  const showFilteredZeroCase = isFiltered || isPlaceholderData

  return (
    <div className={isPlaceholderData ? "opacity-50 transition-opacity" : undefined}>
      {uploads.length > 0 ? (
        <>
          <UploadTable uploads={uploads} withRelations onTagClick={onTagClick} />
          <LoadMoreButton
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
            loadedCount={uploads.length}
          />
        </>
      ) : showFilteredZeroCase ? (
        <FilteredZeroCase name="Dokumente" onReset={onResetFilters} />
      ) : (
        <ZeroCase visible name="Dokumente" verb="hochgeladen" />
      )}
    </div>
  )
}
