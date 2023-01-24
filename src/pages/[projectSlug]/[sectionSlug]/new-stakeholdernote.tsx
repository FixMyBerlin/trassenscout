import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getSection from "src/sections/queries/getSection"
import {
  FORM_ERROR,
  StakeholdernoteForm,
} from "src/stakeholdernotes/components/StakeholdernoteForm"
import createStakeholdernote from "src/stakeholdernotes/mutations/createStakeholdernote"
import { StakeholdernoteSchema } from "src/stakeholdernotes/schema"

const NewStakeholdernote = () => {
  const router = useRouter()
  const [createStakeholdernoteMutation] = useMutation(createStakeholdernote)
  const sectionSlug = useParam("sectionSlug", "string")
  const projectSlug = useParam("projectSlug", "string")
  const [section] = useQuery(getSection, { sectionSlug, projectSlug })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const stakeholdernote = await createStakeholdernoteMutation({
        ...values,
        sectionId: section.id,
      })
      await router.push(Routes.ShowStakeholdernotePage({ stakeholdernoteId: stakeholdernote.id }))
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neuen Stakeholdernote erstellen" />

      <PageHeader
        title="Stakeholder erstellen"
        subtitle={`Für die Teilstrecke ${quote(section.title)}`}
      />

      <StakeholdernoteForm
        submitText="Erstellen"
        // TODO schema: See `__ModelIdParam__/edit.tsx` for detailed instruction.
        schema={StakeholdernoteSchema.omit({ sectionId: true })}
        // initialValues={{}} // Use only when custom initial values are needed
        onSubmit={handleSubmit}
      />
      <p>
        <Link
          href={Routes.SectionDashboardPage({
            sectionSlug: sectionSlug!,
            projectSlug: projectSlug!,
          })}
        >
          Zurück zum Dashboard der Teilstrecke
        </Link>
      </p>
    </>
  )
}

const NewStakeholdernotePage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewStakeholdernote />
      </Suspense>
    </LayoutRs>
  )
}

NewStakeholdernotePage.authenticate = true

export default NewStakeholdernotePage
