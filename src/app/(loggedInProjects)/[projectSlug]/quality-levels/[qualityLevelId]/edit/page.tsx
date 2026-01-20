import { EditQualityLevelForm } from "@/src/app/(loggedInProjects)/[projectSlug]/quality-levels/_components/EditQualityLevelForm"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getQualityLevel from "@/src/server/qualityLevels/queries/getQualityLevel"
import { Metadata, Route } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Ausbaustandard"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; qualityLevelId: string }
}

export default async function EditQualityLevelPage({
  params: { projectSlug, qualityLevelId },
}: Props) {
  const qualityLevel = await invoke(getQualityLevel, {
    projectSlug,
    id: Number(qualityLevelId),
  })

  return (
    <>
      <PageHeader title="Ausbaustandard bearbeiten" className="mt-12" />
      <EditQualityLevelForm qualityLevel={qualityLevel} projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/quality-levels` as Route}>Zurück zur Übersicht</Link>
    </>
  )
}
