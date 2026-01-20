import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { Metadata, Route } from "next"
import "server-only"
import { NewNetworkHierarchyForm } from "../_components/NewNetworkHierarchyForm"

export const metadata: Metadata = {
  title: seoNewTitle("Ausbaustandard"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function NewNetworkHierarchyPage({ params: { projectSlug } }: Props) {
  return (
    <>
      <PageHeader title="Netzstufe hinzufügen" className="mt-12" />
      <NewNetworkHierarchyForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/network-hierarchy` as Route}>Zurück zur Übersicht</Link>
    </>
  )
}
