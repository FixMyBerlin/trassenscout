import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Link, linkStyles } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import deleteStakeholdernote from "src/stakeholdernotes/mutations/deleteStakeholdernote"
import getStakeholdernote from "src/stakeholdernotes/queries/getStakeholdernote"

export const Stakeholdernote = () => {
  const router = useRouter()
  const { projectSlug, sectionSlug, subsectionSlug } = useSlugs()
  const stakeholdernoteId = useParam("stakeholdernoteId", "number")
  const [stakeholdernote] = useQuery(getStakeholdernote, { id: stakeholdernoteId })

  const [deleteStakeholdernoteMutation] = useMutation(deleteStakeholdernote)
  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${stakeholdernote.id} unwiderruflich löschen?`)) {
      await deleteStakeholdernoteMutation({ id: stakeholdernote.id })
      await router.push(
        Routes.SubsectionDashboardPage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
          subsectionPath: [subsectionSlug!],
        })
      )
    }
  }

  return (
    <>
      <MetaTags noindex title={`TöB ${quote(stakeholdernote.title)}`} />
      <PageHeader title={`TöB ${quote(stakeholdernote.title)}`} />

      <ButtonWrapper className="mt-10">
        <Link
          href={Routes.EditStakeholdernotePage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
            subsectionSlug: subsectionSlug!,
            stakeholdernoteId: stakeholdernote.id,
          })}
        >
          Bearbeiten
        </Link>
        <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
          Löschen
        </button>
        <Link
          href={Routes.SubsectionDashboardPage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
            subsectionPath: [subsectionSlug!],
          })}
        >
          Zurück zum Planungsabschnitt
        </Link>
      </ButtonWrapper>

      <SuperAdminLogData data={stakeholdernote} />
    </>
  )
}

const ShowStakeholdernotePage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <Stakeholdernote />
      </Suspense>
    </LayoutRs>
  )
}

ShowStakeholdernotePage.authenticate = true

export default ShowStakeholdernotePage
