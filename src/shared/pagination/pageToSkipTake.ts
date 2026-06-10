export function pageToSkipTake(page: number, pageSize: number) {
  const safePage = Math.max(1, page)
  const safePageSize = Math.max(1, pageSize)

  return {
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
    page: safePage,
    pageSize: safePageSize,
  }
}
