import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getSubsubsectionStatussWithCount from "@/src/server/subsubsectionStatus/queries/getSubsubsectionStatussWithCount"
import { Metadata, Route } from "next"
import "server-only"
import { SubsubsectionStatussTable } from "./_components/SubsubsectionStatussTable"

export const metadata: Metadata = {
  title: "Phase",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
  searchParams: { from?: string }
}

export default async function SubsubsectionStatussPage({
  params: { projectSlug },
  searchParams,
}: Props) {
  const { subsubsectionStatuss } = await invoke(getSubsubsectionStatussWithCount, {
    projectSlug,
  })

  // Preserve `from` param for navigation within this domain
  const fromParam = searchParams?.from
  const appendFrom = fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""

  return (
    <>
      <PageHeader title="Phase" className="mt-12" />
      <SubsubsectionStatussTable subsubsectionStatuss={subsubsectionStatuss} fromPath={fromParam} />
      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/subsubsection-status/new${appendFrom}` as Route}
        >
          Neue Phase
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromParam} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ subsubsectionStatuss }} />
    </>
  )
}
