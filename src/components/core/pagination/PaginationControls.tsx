import type { PaginationResult } from "@/src/shared/pagination/types"
import { PaginationNav } from "./PaginationNav"

type PaginationControlsResult = Pick<PaginationResult, "from" | "to" | "count" | "hasMore">

type Props = {
  page: number
  result: PaginationControlsResult
  onPageChange: (page: number) => void
}

export const PaginationControls = ({ page, result, onPageChange }: Props) => {
  const { from, to, count, hasMore } = result

  return (
    <PaginationNav
      from={from}
      to={to}
      count={count}
      canGoPrevious={page > 1}
      canGoNext={hasMore}
      onPrevious={() => onPageChange(page - 1)}
      onNext={() => onPageChange(page + 1)}
    />
  )
}
