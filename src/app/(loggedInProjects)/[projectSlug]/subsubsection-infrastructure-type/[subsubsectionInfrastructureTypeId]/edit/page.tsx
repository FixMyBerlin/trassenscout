import { EditSubsubsectionInfrastructureTypeForm } from "@/src/app/(loggedInProjects)/[projectSlug]/subsubsection-infrastructure-type/_components/EditSubsubsectionInfrastructureTypeForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getSubsubsectionInfrastructureType from "@/src/server/subsubsectionInfrastructureType/queries/getSubsubsectionInfrastructureType"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Gegenstand der Förderung"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; subsubsectionInfrastructureTypeId: string }
  searchParams: { from?: string }
}

export default async function EditSubsubsectionInfrastructureTypePage({
  params: { projectSlug, subsubsectionInfrastructureTypeId },
  searchParams,
}: Props) {
  const subsubsectionInfrastructureType = await invoke(getSubsubsectionInfrastructureType, {
    projectSlug,
    id: Number(subsubsectionInfrastructureTypeId),
  })

  const fromParam = searchParams?.from

  return (
    <>
      <PageHeader title="Gegenstand der Förderung bearbeiten" className="mt-12" />
      <EditSubsubsectionInfrastructureTypeForm
        subsubsectionInfrastructureType={subsubsectionInfrastructureType}
        projectSlug={projectSlug}
        fromParam={fromParam}
      />
    </>
  )
}
