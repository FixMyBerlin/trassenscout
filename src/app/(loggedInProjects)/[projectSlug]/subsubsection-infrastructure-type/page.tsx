import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getSubsubsectionInfrastructureTypesWithCount from "@/src/server/subsubsectionInfrastructureType/queries/getSubsubsectionInfrastructureTypesWithCount"
import { Metadata } from "next"
import "server-only"
import { SubsubsectionInfrastructureTypesTable } from "./_components/SubsubsectionInfrastructureTypesTable"

export const metadata: Metadata = {
  title: "Fördergegenstand",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function SubsubsectionInfrastructureTypesPage({
  params: { projectSlug },
}: Props) {
  const { subsubsectionInfrastructureTypes } = await invoke(
    getSubsubsectionInfrastructureTypesWithCount,
    {
      projectSlug,
    },
  )

  return (
    <>
      <PageHeader title="Fördergegenstand" className="mt-12" />
      <SubsubsectionInfrastructureTypesTable
        subsubsectionInfrastructureTypes={subsubsectionInfrastructureTypes}
      />
      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/subsubsection-infrastructure-type/new`}
        >
          Neuer Fördergegenstand
        </Link>
      </IfUserCanEdit>
      <SuperAdminLogData data={{ subsubsectionInfrastructureTypes }} />
    </>
  )
}
