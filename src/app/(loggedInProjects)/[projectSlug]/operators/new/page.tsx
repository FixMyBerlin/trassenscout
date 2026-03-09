import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { Metadata, Route } from "next"
import "server-only"
import { NewOperatorForm } from "../_components/NewOperatorForm"

export const metadata: Metadata = {
  title: seoNewTitle("Baulastträger"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
  searchParams: { from?: string }
}

export default async function NewOperatorPage({ params: { projectSlug }, searchParams }: Props) {
  const fromParam = searchParams?.from
  const listPath = `/${projectSlug}/operators` as Route
  const appendFrom = fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""

  return (
    <>
      <PageHeader title="Baulastträger hinzufügen" className="mt-12" />
      <NewOperatorForm projectSlug={projectSlug} fromParam={fromParam} />
      <hr className="my-5 text-gray-200" />
      <Link href={`${listPath}${appendFrom}` as Route}>Zurück zur Übersicht</Link>
    </>
  )
}
