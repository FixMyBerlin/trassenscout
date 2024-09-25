import { Breadcrumb } from "@/src/core/components/Breadcrumb/Breadcrumb"
import { SubsectionMapIcon } from "@/src/core/components/Map/Icons"
import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoTitleSlug, shortTitle, startEnd } from "@/src/core/components/text"
import { useSlugs } from "@/src/core/hooks"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { IfUserCanEdit } from "@/src/memberships/components/IfUserCan"
import { StakeholderSection } from "@/src/stakeholdernotes/components/StakeholderSection"
import { SubsectionTabs } from "@/src/subsections/components/SubsectionTabs"
import getSubsections from "@/src/subsections/queries/getSubsections"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"

// Page Renders Subsection _AND_ Subsubsection (as Panel)
export const SubsectionStakeholdersWithQuery = () => {
  const { projectSlug, subsectionSlug } = useSlugs()

  const [{ subsections }] = useQuery(getSubsections, { projectSlug: projectSlug! })
  const subsection = subsections.find((ss) => ss.slug === subsectionSlug)

  if (!subsection) {
    return <Spinner page />
  }

  return (
    <>
      <MetaTags noindex title={seoTitleSlug(subsection.slug)} />

      <Breadcrumb />
      <PageHeader
        titleIcon={<SubsectionMapIcon label={shortTitle(subsection.slug)} />}
        title={startEnd(subsection)}
        className="mt-12"
        subtitle={subsection.operator?.title}
        action={
          <IfUserCanEdit>
            <Link
              icon="edit"
              href={Routes.EditSubsectionPage({
                projectSlug: projectSlug!,
                subsectionSlug: subsectionSlug!,
              })}
            >
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
        description={<SubsectionTabs />}
      />

      <StakeholderSection subsectionId={subsection.id} />
    </>
  )
}

const SubsectionStakeholdersPage: BlitzPage = () => {
  const { subsectionSlug } = useSlugs()
  if (subsectionSlug === undefined) return null

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <SubsectionStakeholdersWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

SubsectionStakeholdersPage.authenticate = true

export default SubsectionStakeholdersPage
