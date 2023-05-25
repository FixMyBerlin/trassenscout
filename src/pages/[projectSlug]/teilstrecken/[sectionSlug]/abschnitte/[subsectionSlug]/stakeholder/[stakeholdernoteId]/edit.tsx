import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote, seoEditTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import {
  FORM_ERROR,
  StakeholdernoteForm,
} from "src/stakeholdernotes/components/StakeholdernoteForm"
import updateStakeholdernote from "src/stakeholdernotes/mutations/updateStakeholdernote"
import getStakeholdernote from "src/stakeholdernotes/queries/getStakeholdernote"
import { StakeholdernoteSchema } from "src/stakeholdernotes/schema"

const EditStakeholdernote = () => {
  const router = useRouter()
  const { projectSlug, sectionSlug, subsectionSlug } = useSlugs()
  const stakeholdernoteId = useParam("stakeholdernoteId", "number")
  const [stakeholdernote, { setQueryData }] = useQuery(
    getStakeholdernote,
    { id: stakeholdernoteId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
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
        Routes.SubsectionDashboardPage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
          subsectionSlug: subsectionSlug!,
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title={seoEditTitle("TöB")} />
      <PageHeader title="TöB bearbeiten" className="mt-12" />

      <StakeholdernoteForm
        className="mt-10"
        submitText="Speichern"
        schema={StakeholdernoteSchema}
        initialValues={stakeholdernote}
        onSubmit={handleSubmit}
      />

      <SuperAdminLogData data={stakeholdernote} />
    </>
  )
}

const EditStakeholdernotePage: BlitzPage = () => {
  const { projectSlug, sectionSlug } = useSlugs()

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditStakeholdernote />
      </Suspense>

      <hr className="my-5" />
      <p>
        <Link
          href={Routes.SectionDashboardPage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
          })}
        >
          Zurück zum Planungsabschnitt
        </Link>
      </p>
    </LayoutRs>
  )
}

EditStakeholdernotePage.authenticate = true

export default EditStakeholdernotePage
