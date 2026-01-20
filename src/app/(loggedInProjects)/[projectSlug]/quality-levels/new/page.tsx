import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { Metadata, Route } from "next"
import "server-only"
import { NewQualityLevelForm } from "../_components/NewQualityLevelForm"

export const metadata: Metadata = {
  title: seoNewTitle("Ausbaustandard"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function NewQualityLevelPage({ params: { projectSlug } }: Props) {
  return (
    <>
      <PageHeader title="Ausbaustandard hinzufügen" className="mt-12" />
      <NewQualityLevelForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/quality-levels` as Route}>Zurück zur Übersicht</Link>
    </>
  )
}
