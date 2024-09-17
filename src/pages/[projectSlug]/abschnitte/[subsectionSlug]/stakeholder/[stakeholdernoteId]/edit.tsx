import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { Link, linkStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { useSlugs } from "@/src/core/hooks"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { hashStakeholdernotes } from "@/src/stakeholdernotes/components/StakeholderSection"
import {
  FORM_ERROR,
  StakeholdernoteForm,
} from "@/src/stakeholdernotes/components/StakeholdernoteForm"
import deleteStakeholdernote from "@/src/stakeholdernotes/mutations/deleteStakeholdernote"
import updateStakeholdernote from "@/src/stakeholdernotes/mutations/updateStakeholdernote"
import getStakeholdernote from "@/src/stakeholdernotes/queries/getStakeholdernote"
import { StakeholdernoteSchema } from "@/src/stakeholdernotes/schema"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"

const EditStakeholdernote = () => {
  const router = useRouter()
  const { projectSlug, subsectionSlug } = useSlugs()
  const stakeholdernoteId = useParam("stakeholdernoteId", "number")
  const [stakeholdernote, { setQueryData }] = useQuery(
    getStakeholdernote,
    { id: stakeholdernoteId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateStakeholdernoteMutation] = useMutation(updateStakeholdernote)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateStakeholdernoteMutation({
        id: stakeholdernote.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(
        Routes.SubsectionStakeholdersPage({
          projectSlug: projectSlug!,
          subsectionSlug: subsectionSlug!,
          stakeholderDetails: updated.id,
        }),
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const [deleteStakeholdernoteMutation] = useMutation(deleteStakeholdernote)
  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${stakeholdernote.id} unwiderruflich löschen?`)) {
      await deleteStakeholdernoteMutation({ id: stakeholdernote.id })
      await router.push({
        ...Routes.SubsectionDashboardPage({
          projectSlug: projectSlug!,
          subsectionSlug: subsectionSlug!,
        }),
        hash: hashStakeholdernotes,
      })
    }
  }

  return (
    <>
      <MetaTags noindex title={seoEditTitle("TÖB")} />
      <PageHeader title="TÖB bearbeiten" className="mt-12" />

      <StakeholdernoteForm
        className="mt-10"
        submitText="Speichern"
        schema={StakeholdernoteSchema}
        initialValues={stakeholdernote}
        onSubmit={handleSubmit}
      />

      <ButtonWrapper className="mt-10">
        <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
          Löschen
        </button>
      </ButtonWrapper>

      <SuperAdminLogData data={stakeholdernote} />
    </>
  )
}

const EditStakeholdernotePage: BlitzPage = () => {
  const { projectSlug, subsectionSlug } = useSlugs()

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditStakeholdernote />
      </Suspense>

      <hr className="my-5" />
      <p>
        <Link
          href={{
            ...Routes.SubsectionDashboardPage({
              projectSlug: projectSlug!,
              subsectionSlug: subsectionSlug!,
            }),
            hash: hashStakeholdernotes,
          }}
        >
          Zurück zum Planungsabschnitt
        </Link>
      </p>
    </LayoutRs>
  )
}

EditStakeholdernotePage.authenticate = true

export default EditStakeholdernotePage
