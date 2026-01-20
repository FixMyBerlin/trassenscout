import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { Metadata } from "next"
import "server-only"
import { NewSubsectionStatusForm } from "../_components/NewSubsectionStatusForm"

export const metadata: Metadata = {
  title: seoNewTitle("Status"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function NewSubsectionStatusPage({ params: { projectSlug } }: Props) {
  return (
    <>
      <PageHeader title="Status hinzufügen" className="mt-12" />

      <NewSubsectionStatusForm projectSlug={projectSlug} />
    </>
  )
}
