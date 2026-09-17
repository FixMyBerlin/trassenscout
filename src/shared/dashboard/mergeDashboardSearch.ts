import type { DashboardSearch } from "./searchSchemas"

export function mergeDashboardSearch<TSearch extends Record<string, unknown>>(
  previous: TSearch,
  updates: Partial<DashboardSearch>,
): TSearch {
  const next: Record<string, unknown> = { ...previous }

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) delete next[key]
    else next[key] = value
  }

  return next as TSearch
}
