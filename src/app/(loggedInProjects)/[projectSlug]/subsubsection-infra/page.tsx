import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getSubsubsectionInfrasWithCount from "@/src/server/subsubsectionInfra/queries/getSubsubsectionInfrasWithCount"
import { Metadata } from "next"
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
}

export default async function SubsubsectionInfrasPage({ params: { projectSlug } }: Props) {
  const { subsubsectionInfras } = await invoke(getSubsubsectionInfrasWithCount, {
    projectSlug,
  })

  return (
    <>
      <PageHeader title="Führungsformen" className="mt-12" />
      <SubsubsectionInfrasTable subsubsectionInfras={subsubsectionInfras} />
      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/subsubsection-infra/new`}
        >
          Neue Führungsform
        </Link>
      </IfUserCanEdit>
      <SuperAdminLogData data={{ subsubsectionInfras }} />
    </>
  )
}
