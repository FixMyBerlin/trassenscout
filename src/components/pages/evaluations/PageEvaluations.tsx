import { useSuspenseQuery } from "@tanstack/react-query"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { evaluationsPageQueryOptions } from "@/src/server/evaluationsPage/evaluationsPageQueryOptions"

export function PageEvaluations() {
  const { data: evaluationsPage } = useSuspenseQuery(evaluationsPageQueryOptions())

  return (
    <>
      <PageHeader title={evaluationsPage.title} />
      <Markdown markdown={evaluationsPage.markdown} />
    </>
  )
}
