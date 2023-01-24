import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
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
  const stakeholdernoteId = useParam("stakeholdernoteId", "number")
  const sectionSlug = useParam("sectionSlug", "string")
  const projectSlug = useParam("projectSlug", "string")
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
        Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug: sectionSlug! })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title={`Stakeholdernote ${stakeholdernote.title} bearbeiten`} />
      <PageHeader title={quote(stakeholdernote.title)} subtitle="Stakeholder bearbeiten" />

      <StakeholdernoteForm
        submitText="Speichern"
        // TODO use a zod schema for form validation
        // 1. Move the schema from mutations/createStakeholdernote.ts to `Stakeholdernote/schema.ts`
        //   - Name `StakeholdernoteSchema`
        // 2. Import the zod schema here.
        // 3. Update the mutations/updateStakeholdernote.ts to
        //   `const UpdateStakeholdernoteSchema = StakeholdernoteSchema.merge(z.object({id: z.number(),}))`
        //schema={StakeholdernoteSchema}
        initialValues={stakeholdernote}
        onSubmit={handleSubmit}
      />

      <SuperAdminBox>
        <pre>{JSON.stringify(stakeholdernote, null, 2)}</pre>
      </SuperAdminBox>

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

const EditStakeholdernotePage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditStakeholdernote />
      </Suspense>
    </LayoutRs>
  )
}

EditStakeholdernotePage.authenticate = true

export default EditStakeholdernotePage
