import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getSubsubsectionInfrastructureTypesWithCount from "@/src/server/subsubsectionInfrastructureType/queries/getSubsubsectionInfrastructureTypesWithCount"
import { Metadata, Route } from "next"
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
  searchParams: { from?: string }
}

export default async function SubsubsectionInfrastructureTypesPage({
  params: { projectSlug },
  searchParams,
}: Props) {
  const { subsubsectionInfrastructureTypes } = await invoke(
    getSubsubsectionInfrastructureTypesWithCount,
    {
      projectSlug,
    },
  )

  // Preserve `from` param for navigation within this domain
  const fromParam = searchParams?.from
  const appendFrom = fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""

  return (
    <>
      <PageHeader title="Fördergegenstand" className="mt-12" />
      <SubsubsectionInfrastructureTypesTable
        subsubsectionInfrastructureTypes={subsubsectionInfrastructureTypes}
        fromPath={fromParam}
      />
      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/subsubsection-infrastructure-type/new${appendFrom}` as Route}
        >
          Neuer Fördergegenstand
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromParam} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ subsubsectionInfrastructureTypes }} />
    </>
  )
}
