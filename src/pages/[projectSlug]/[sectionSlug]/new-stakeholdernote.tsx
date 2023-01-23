import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { Spinner } from "src/core/components/Spinner"
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
  const [section] = useQuery(getSection, { slug: sectionSlug })

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

      <h1>Stakeholder erstellen</h1>

      <StakeholdernoteForm
        submitText="Erstellen"
        // TODO schema: See `__ModelIdParam__/edit.tsx` for detailed instruction.
        schema={StakeholdernoteSchema.omit({ sectionId: true })}
        // initialValues={{}} // Use only when custom initial values are needed
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewStakeholdernotePage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewStakeholdernote />
      </Suspense>

      <p>
        <Link href={Routes.StakeholdernotesPage()}>Alle Stakeholdernotes</Link>
      </p>
    </LayoutRs>
  )
}

NewStakeholdernotePage.authenticate = true

export default NewStakeholdernotePage
