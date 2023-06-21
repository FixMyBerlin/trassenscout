import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { longTitle, quote, seoNewTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FORM_ERROR } from "src/stakeholdernotes/components/StakeholdernoteForm"
import { StakeholdernoteMultiForm } from "src/stakeholdernotes/components/StakeholdernoteMultiForm"
import createStakeholdernote from "src/stakeholdernotes/mutations/createStakeholdernote"
import { StakeholdernoteMultiSchema } from "src/stakeholdernotes/schema"
import getSubsection from "src/subsections/queries/getSubsection"

const NewStakeholdernotesWithQuery = () => {
  const router = useRouter()
  const [createStakeholdernoteMutation] = useMutation(createStakeholdernote)

  const { projectSlug, subsectionSlug } = useSlugs()
  const [subsection] = useQuery(getSubsection, {
    projectSlug: projectSlug!,
    subsectionSlug: subsectionSlug!,
  })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    const createStakeholderNoteArray = values.title.split("\n").map((i: string) => {
      return { title: i, subsectionId: subsection.id, status: "PENDING", statusText: null }
    })

    try {
      for (let i = 0; i < createStakeholderNoteArray.length; i++) {
        await createStakeholdernoteMutation(createStakeholderNoteArray[i])
      }
      await router.push(
        Routes.SubsectionDashboardPage({
          projectSlug: projectSlug!,
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
      <MetaTags noindex title={seoNewTitle("Mehrere TÖB")} />
      <PageHeader
        title="Mehrere TÖBs hinzufügen"
        subtitle={longTitle(subsection.slug)}
        className="mt-12"
      />

      <StakeholdernoteMultiForm
        className="mt-10"
        submitText="Erstellen"
        schema={StakeholdernoteMultiSchema}
        // initialValues={} // Not used here due to custom form
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewStakeholdernotesPage: BlitzPage = () => {
  const { projectSlug, subsectionSlug } = useSlugs()

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewStakeholdernotesWithQuery />
      </Suspense>

      <p className="mt-5">
        <Link
          href={Routes.SubsectionDashboardPage({
            projectSlug: projectSlug!,
            subsectionSlug: subsectionSlug!,
          })}
        >
          Zurück zum Planungsabschnitt
        </Link>
      </p>
    </LayoutRs>
  )
}

NewStakeholdernotesPage.authenticate = true

export default NewStakeholdernotesPage
