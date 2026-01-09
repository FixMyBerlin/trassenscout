import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { Metadata, Route } from "next"
import "server-only"
import { NewSubsubsectionSpecialForm } from "../_components/NewSubsubsectionSpecialForm"

export const metadata: Metadata = {
  title: seoNewTitle("Besonderheit"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function NewSubsubsectionSpecialPage({ params: { projectSlug } }: Props) {
  return (
    <>
      <PageHeader title="Besonderheit hinzufügen" className="mt-12" />
      <NewSubsubsectionSpecialForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/subsubsection-special` as Route}>Zurück zur Übersicht</Link>
    </>
  )
}
