import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { Metadata, Route } from "next"
import "server-only"
import { NewDealAreaStatusForm } from "../_components/NewDealAreaStatusForm"

export const metadata: Metadata = {
  title: seoNewTitle("Status"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
  searchParams: { from?: string }
}

export default async function NewDealAreaStatusPage({
  params: { projectSlug },
  searchParams,
}: Props) {
  const fromParam = searchParams?.from
  const listPath = `/${projectSlug}/dealflaechen-status` as Route
  const appendFrom = fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""

  return (
    <>
      <PageHeader title="Status hinzufügen" className="mt-12" />
      <NewDealAreaStatusForm projectSlug={projectSlug} fromParam={fromParam} />
      <hr className="my-5 text-gray-200" />
      <Link href={`${listPath}${appendFrom}` as Route}>Zurück zur Übersicht</Link>
    </>
  )
}
