import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { Metadata, Route } from "next"
import "server-only"
import { NewSubsubsectionInfraForm } from "../_components/NewSubsubsectionInfraForm"

export const metadata: Metadata = {
  title: seoNewTitle("Führungsform"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function NewSubsubsectionInfraPage({ params: { projectSlug } }: Props) {
  return (
    <>
      <PageHeader title="Führungsform hinzufügen" className="mt-12" />
      <NewSubsubsectionInfraForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/subsubsection-infra` as Route}>Zurück zur Übersicht</Link>
    </>
  )
}
