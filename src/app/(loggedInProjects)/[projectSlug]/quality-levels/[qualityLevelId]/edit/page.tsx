import { EditQualityLevelForm } from "@/src/app/(loggedInProjects)/[projectSlug]/quality-levels/_components/EditQualityLevelForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getQualityLevel from "@/src/server/qualityLevels/queries/getQualityLevel"
import { Metadata } from "next"
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
    </>
  )
}
