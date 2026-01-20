import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { Metadata, Route } from "next"
import "server-only"
import { NewSubsubsectionInfrastructureTypeForm } from "../_components/NewSubsubsectionInfrastructureTypeForm"

export const metadata: Metadata = {
  title: seoNewTitle("Fördergegenstand"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function NewSubsubsectionInfrastructureTypePage({
  params: { projectSlug },
}: Props) {
  return (
    <>
      <PageHeader title="Fördergegenstand hinzufügen" className="mt-12" />
      <NewSubsubsectionInfrastructureTypeForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/subsubsection-infrastructure-type` as Route}>
        Zurück zur Übersicht
      </Link>
    </>
  )
}
