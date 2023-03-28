import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Stakeholdernote } from "@prisma/client"
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
import { StakeholdernoteMultiForm } from "src/stakeholdernotes/components/StakeholdernoteMultiForm"
import createStakeholdernote from "src/stakeholdernotes/mutations/createStakeholdernote"
import { StakeholdernoteMultiSchema, StakeholdernoteSchema } from "src/stakeholdernotes/schema"

const NewStakeholdernoteMulti = () => {
  const router = useRouter()
  const [createStakeholdernoteMutation] = useMutation(createStakeholdernote)
  const sectionSlug = useParam("sectionSlug", "string")
  const projectSlug = useParam("projectSlug", "string")
  const [section] = useQuery(getSection, { sectionSlug, projectSlug })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    const createStakeholderNoteArray = values.title.split("\n").map((i: string) => {
      return { title: i, sectionId: section.id, status: "PENDING", statusText: null }
    })

    try {
      for (let i = 0; i < createStakeholderNoteArray.length; i++) {
        await createStakeholdernoteMutation(createStakeholderNoteArray[i])
      }
      await router.push(
        Routes.SectionDashboardPage({ sectionSlug: sectionSlug!, projectSlug: projectSlug! })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title="Mehrere Stakeholder erstellen" />

      <PageHeader
        title="Mehrere Stakeholder erstellen"
        subtitle={`Für die Teilstrecke ${quote(section.title)}`}
      />

      <StakeholdernoteMultiForm
        submitText="Erstellen"
        // TODO schema: See `__ModelIdParam__/edit.tsx` for detailed instruction.
        schema={StakeholdernoteMultiSchema}
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

const NewStakeholdernoteMultiPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewStakeholdernoteMulti />
      </Suspense>
    </LayoutRs>
  )
}

NewStakeholdernoteMultiPage.authenticate = true

export default NewStakeholdernoteMultiPage
