import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getSubsubsectionStatussWithCount from "@/src/server/subsubsectionStatus/queries/getSubsubsectionStatussWithCount"
import { Metadata } from "next"
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
}

export default async function SubsubsectionStatussPage({ params: { projectSlug } }: Props) {
  const { subsubsectionStatuss } = await invoke(getSubsubsectionStatussWithCount, {
    projectSlug,
  })

  return (
    <>
      <PageHeader title="Phase" className="mt-12" />
      <SubsubsectionStatussTable subsubsectionStatuss={subsubsectionStatuss} />
      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/subsubsection-status/new`}
        >
          Neue Phase
        </Link>
      </IfUserCanEdit>
      <SuperAdminLogData data={{ subsubsectionStatuss }} />
    </>
  )
}
