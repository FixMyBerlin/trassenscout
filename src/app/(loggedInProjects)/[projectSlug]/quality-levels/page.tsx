import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getQualityLevelsWithCount from "@/src/server/qualityLevels/queries/getQualityLevelsWithCount"
import { Metadata } from "next"
import "server-only"
import { QualityLevelsTable } from "./_components/QualityLevelsTable"

export const metadata: Metadata = {
  title: "Ausbaustandards",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function QualityLevelsPage({ params: { projectSlug } }: Props) {
  const { qualityLevels } = await invoke(getQualityLevelsWithCount, {
    projectSlug,
  })

  return (
    <>
      <PageHeader title="Ausbaustandards" className="mt-12" />
      <QualityLevelsTable qualityLevels={qualityLevels} />
      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/quality-levels/new`}
        >
          Neuer Ausbaustandard
        </Link>
      </IfUserCanEdit>
      <SuperAdminLogData data={{ qualityLevels }} />
    </>
  )
}
