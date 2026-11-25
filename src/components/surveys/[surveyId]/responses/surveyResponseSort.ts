import type { SurveyResponseSortColumn } from "@/src/shared/survey-responses/searchSchemas"
import type { SortValues } from "@/src/shared/tableSort/sortRows"

type SurveyResponseSortRow = { id: number; status: string | null }

export function surveyResponseSortValues(
  statuses: readonly { value: string; label: string }[],
): SortValues<SurveyResponseSortRow, SurveyResponseSortColumn> {
  const statusLabels = new Map(statuses.map(({ value, label }) => [value, label]))
  return {
    id: (response) => response.id,
    status: (response) => (response.status ? statusLabels.get(response.status) : null),
  }
}
