import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { Metadata, Route } from "next"
import "server-only"
import { NewContactForm } from "../_components/NewContactForm"

export const metadata: Metadata = {
  title: seoNewTitle("Kontakt"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function NewContactPage({ params: { projectSlug } }: Props) {
  return (
    <>
      <PageHeader title="Neuer Kontakt" className="mt-12" />
      <NewContactForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/contacts` as Route}>Zurück zur Kontaktliste</Link>
    </>
  )
}
