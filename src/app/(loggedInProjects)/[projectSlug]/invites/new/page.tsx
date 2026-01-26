import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoIndexTitle } from "@/src/core/components/text"
import { Metadata, Route } from "next"
import "server-only"
import { getContactsTabs } from "../../contacts/_utils/contactsTabs"
import { NewInviteForm } from "../_components/NewInviteForm"

export const metadata: Metadata = {
  title: seoIndexTitle("Teammitglied einladen"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function NewProjectTeamInvitePage({ params: { projectSlug } }: Props) {
  const tabs = await getContactsTabs(projectSlug)

  return (
    <>
      <PageHeader title="Neues Teammitglied einladen" className="mt-12" />
      <NewInviteForm projectSlug={projectSlug} />
      <p className="mt-5">
        <Link href={`/${projectSlug}/invites` as Route}>Zurück zur Liste der Einladungen</Link>
      </p>
    </>
  )
}
