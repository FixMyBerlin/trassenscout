import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getSubsubsectionInfrasWithCount from "@/src/server/subsubsectionInfra/queries/getSubsubsectionInfrasWithCount"
import { Metadata, Route } from "next"
import "server-only"
import { SubsubsectionInfrasTable } from "./_components/SubsubsectionInfrasTable"

export const metadata: Metadata = {
  title: "Führungsformen",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
  searchParams: { from?: string }
}

export default async function SubsubsectionInfrasPage({
  params: { projectSlug },
  searchParams,
}: Props) {
  const { subsubsectionInfras } = await invoke(getSubsubsectionInfrasWithCount, {
    projectSlug,
  })

  // Preserve `from` param for navigation within this domain
  const fromParam = searchParams?.from
  const appendFrom = fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""

  return (
    <>
      <PageHeader title="Führungsformen" className="mt-12" />
      <SubsubsectionInfrasTable subsubsectionInfras={subsubsectionInfras} fromPath={fromParam} />
      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/subsubsection-infra/new${appendFrom}` as Route}
        >
          Neue Führungsform
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromParam} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ subsubsectionInfras }} />
    </>
  )
}
