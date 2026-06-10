/**
 * Shared options for in-place navigations (filters, pagination, map selection)
 * that update URL search without jumping scroll to top.
 *
 * TanStack native: `{ replace: true, resetScroll: false }` on `navigate()` or
 * `<Link replace resetScroll={false} />`. Kept as one object so call sites stay
 * consistent (`usePagination`, filter hooks, etc.).
 */
export const preserveScrollNavigateOptions = {
  replace: true,
  resetScroll: false,
} as const
