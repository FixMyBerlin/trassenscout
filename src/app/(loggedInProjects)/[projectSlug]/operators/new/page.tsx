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
}

export default async function NewOperatorPage({ params: { projectSlug } }: Props) {
  return (
    <>
      <PageHeader title="Baulastträger hinzufügen" className="mt-12" />
      <NewOperatorForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/operators` as Route}>Zurück zur Übersicht</Link>
    </>
  )
}
