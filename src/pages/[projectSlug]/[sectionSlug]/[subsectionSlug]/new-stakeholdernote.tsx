import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import {
  FORM_ERROR,
  StakeholdernoteForm,
} from "src/stakeholdernotes/components/StakeholdernoteForm"
import createStakeholdernote from "src/stakeholdernotes/mutations/createStakeholdernote"
import { StakeholdernoteSchema } from "src/stakeholdernotes/schema"
import getSubsection from "src/subsections/queries/getSubsection"

const NewStakeholdernote = () => {
  const router = useRouter()
  const [createStakeholdernoteMutation] = useMutation(createStakeholdernote)
  const { projectSlug, sectionSlug, subsectionSlug } = useSlugs()
  const [subsection] = useQuery(getSubsection, {
    projectSlug: projectSlug!,
    sectionSlug: sectionSlug!,
    subsectionSlug: subsectionSlug!,
  })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createStakeholdernoteMutation({
        ...values,
        subsectionId: subsection.id,
      })
      await router.push(
        Routes.SubsectionDashboardPage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
          subsectionPath: [subsectionSlug!],
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neuen TöB erstellen" />
      <PageHeader
        title="Stakeholder erstellen"
        subtitle={`Für die Teilstrecke ${quote(subsection.title)}`}
        className="mt-12"
      />

      <StakeholdernoteForm
        className="mt-10"
        submitText="Erstellen"
        schema={StakeholdernoteSchema.omit({ subsectionId: true })}
        // initialValues={{}} // Use only when custom initial values are needed
        onSubmit={handleSubmit}
      />
      <p className="mt-5">
        <Link
          href={Routes.SubsectionDashboardPage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
            subsectionPath: [subsectionSlug!],
          })}
        >
          Zurück zum Planungsabschnitt
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
