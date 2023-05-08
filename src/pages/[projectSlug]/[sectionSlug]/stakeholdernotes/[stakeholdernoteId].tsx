import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link, linkStyles } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import deleteStakeholdernote from "src/stakeholdernotes/mutations/deleteStakeholdernote"
import getStakeholdernote from "src/stakeholdernotes/queries/getStakeholdernote"

export const Stakeholdernote = () => {
  const router = useRouter()
  const sectionSlug = useParam("sectionSlug", "string")
  const projectSlug = useParam("projectSlug", "string")
  const stakeholdernoteId = useParam("stakeholdernoteId", "number")
  const [deleteStakeholdernoteMutation] = useMutation(deleteStakeholdernote)
  const [stakeholdernote] = useQuery(getStakeholdernote, { id: stakeholdernoteId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${stakeholdernote.id} unwiderruflich löschen?`)) {
      await deleteStakeholdernoteMutation({ id: stakeholdernote.id })
      await router.push(
        Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug: sectionSlug! })
      )
    }
  }

  return (
    <>
      <MetaTags noindex title={`Stakeholder ${quote(stakeholdernote.title)}`} />

      <PageHeader title={`Stakeholder ${quote(stakeholdernote.title)}`} />

      <SuperAdminBox>
        <pre>{JSON.stringify(stakeholdernote, null, 2)}</pre>
      </SuperAdminBox>

      <Link
        href={Routes.EditStakeholdernotePage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
          stakeholdernoteId: stakeholdernote.id,
        })}
      >
        Bearbeiten
      </Link>

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
        Löschen
      </button>
      <p>
        <Link
          href={Routes.SectionDashboardPage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
          })}
        >
          Zurück zum Dashboard der Teilstrecke
        </Link>
      </p>
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
