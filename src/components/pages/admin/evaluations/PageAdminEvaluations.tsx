import { useSuspenseQuery } from "@tanstack/react-query"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminEvaluationsPagesTable } from "@/src/components/admin/evaluations/AdminEvaluationsPagesTable"
import { evaluationsPagesQueryOptions } from "@/src/server/evaluationsPage/evaluationsPageQueryOptions"

export function PageAdminEvaluations() {
  const { data: pages } = useSuspenseQuery(evaluationsPagesQueryOptions())

  return (
    <>
      <AdminPageHeader title="Auswertungen-Seiten" />
      <AdminEvaluationsPagesTable pages={pages} />
    </>
  )
}
