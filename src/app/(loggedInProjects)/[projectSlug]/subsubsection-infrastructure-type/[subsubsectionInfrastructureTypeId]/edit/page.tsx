import { EditSubsubsectionInfrastructureTypeForm } from "@/src/app/(loggedInProjects)/[projectSlug]/subsubsection-infrastructure-type/_components/EditSubsubsectionInfrastructureTypeForm"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getSubsubsectionInfrastructureType from "@/src/server/subsubsectionInfrastructureType/queries/getSubsubsectionInfrastructureType"
import { Metadata, Route } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Fördergegenstand"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; subsubsectionInfrastructureTypeId: string }
}

export default async function EditSubsubsectionInfrastructureTypePage({
  params: { projectSlug, subsubsectionInfrastructureTypeId },
}: Props) {
  const subsubsectionInfrastructureType = await invoke(getSubsubsectionInfrastructureType, {
    projectSlug,
    id: Number(subsubsectionInfrastructureTypeId),
  })

  return (
    <>
      <PageHeader title="Fördergegenstand bearbeiten" className="mt-12" />
      <EditSubsubsectionInfrastructureTypeForm
        subsubsectionInfrastructureType={subsubsectionInfrastructureType}
        projectSlug={projectSlug}
      />
      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/subsubsection-infrastructure-type` as Route}>
        Zurück zur Übersicht
      </Link>
    </>
  )
}
