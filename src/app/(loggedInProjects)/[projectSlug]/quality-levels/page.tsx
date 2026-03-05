import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getQualityLevelsWithCount from "@/src/server/qualityLevels/queries/getQualityLevelsWithCount"
import { Metadata, Route } from "next"
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
  searchParams: { from?: string }
}

export default async function QualityLevelsPage({ params: { projectSlug }, searchParams }: Props) {
  const { qualityLevels } = await invoke(getQualityLevelsWithCount, {
    projectSlug,
  })

  // Preserve `from` param for navigation within this domain
  const fromParam = searchParams?.from
  const appendFrom = fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""

  return (
    <>
      <PageHeader title="Ausbaustandards" className="mt-12" />
      <QualityLevelsTable qualityLevels={qualityLevels} fromPath={fromParam} />
      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/quality-levels/new${appendFrom}` as Route}
        >
          Neuer Ausbaustandard
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromParam} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ qualityLevels }} />
    </>
  )
}
