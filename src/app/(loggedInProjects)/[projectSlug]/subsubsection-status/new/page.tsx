import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { Metadata, Route } from "next"
import "server-only"
import { NewSubsubsectionStatusForm } from "../_components/NewSubsubsectionStatusForm"

export const metadata: Metadata = {
  title: seoNewTitle("Phase"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function NewSubsubsectionStatusPage({ params: { projectSlug } }: Props) {
  return (
    <>
      <PageHeader title="Phase hinzufügen" className="mt-12" />
      <NewSubsubsectionStatusForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/subsubsection-status` as Route}>Zurück zur Übersicht</Link>
    </>
  )
}
