import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { LogEntriesTable } from "@/src/components/admin/log-entries/LogEntriesTable"
import { Notice } from "@/src/components/core/components/Notice/Notice"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { LoadMoreButton } from "@/src/components/core/pagination/LoadMoreButton"
import { logEntriesInfiniteQueryOptions } from "@/src/server/logEntries/logEntriesQueryOptions"

type Props = {
  projectSlug?: string
  months?: number
  showProject?: boolean
  emptyText: string
  withTopBorder?: boolean
  modalsInPlace?: boolean
  fallback: ReactNode
}

export function LogEntriesFeed({
  projectSlug,
  months,
  showProject,
  emptyText,
  withTopBorder,
  modalsInPlace,
  fallback,
}: Props) {
  const { data, isError, isPlaceholderData, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery({
      ...logEntriesInfiniteQueryOptions({ projectSlug, months }),
      placeholderData: keepPreviousData,
    })

  if (!data) {
    return isError ? (
      <div className={pageContentPaddingClassName}>
        <Notice type="error" title="Die Einträge konnten nicht geladen werden.">
          <p>Bitte laden Sie die Seite neu.</p>
        </Notice>
      </div>
    ) : (
      fallback
    )
  }

  const entries = data.pages.flatMap((page) => page.logEntries)
  const isAdmin = data.pages[0]?.isAdmin ?? false

  return (
    <div className={isPlaceholderData ? "opacity-50 transition-opacity" : undefined}>
      <LogEntriesTable
        entries={entries}
        isAdmin={isAdmin}
        showProject={showProject}
        withTopBorder={withTopBorder}
        modalsInPlace={modalsInPlace}
        emptyText={emptyText}
      />
      {entries.length > 0 ? (
        <LoadMoreButton
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => void fetchNextPage()}
          loadedCount={entries.length}
        />
      ) : null}
    </div>
  )
}
