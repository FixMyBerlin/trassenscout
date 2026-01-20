import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getSubsubsectionSpecialsWithCount from "@/src/server/subsubsectionSpecial/queries/getSubsubsectionSpecialsWithCount"
import { Metadata } from "next"
import "server-only"
import { SubsubsectionSpecialsTable } from "./_components/SubsubsectionSpecialsTable"

export const metadata: Metadata = {
  title: "Besonderheiten",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function SubsubsectionSpecialsPage({ params: { projectSlug } }: Props) {
  const { subsubsectionSpecials } = await invoke(getSubsubsectionSpecialsWithCount, {
    projectSlug,
  })

  return (
    <>
      <PageHeader title="Besonderheiten" className="mt-12" />
      <SubsubsectionSpecialsTable subsubsectionSpecials={subsubsectionSpecials} />
      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/subsubsection-special/new`}
        >
          Neue Besonderheit
        </Link>
      </IfUserCanEdit>
      <SuperAdminLogData data={{ subsubsectionSpecials }} />
    </>
  )
}
