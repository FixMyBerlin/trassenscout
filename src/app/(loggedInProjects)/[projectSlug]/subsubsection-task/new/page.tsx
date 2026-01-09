import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { Metadata, Route } from "next"
import "server-only"
import { NewSubsubsectionTaskForm } from "../_components/NewSubsubsectionTaskForm"

export const metadata: Metadata = {
  title: seoNewTitle("Eintragstyp"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function NewSubsubsectionTaskPage({ params: { projectSlug } }: Props) {
  return (
    <>
      <PageHeader title="Neuer Eintragstyp" className="mt-12" />
      <NewSubsubsectionTaskForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/subsubsection-task` as Route}>Zurück zur Übersicht</Link>
    </>
  )
}
