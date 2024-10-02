import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { longTitle, seoNewTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { useSlug } from "@/src/core/routes/usePagesDirectorySlug"
import { FORM_ERROR } from "@/src/pagesComponents/stakeholdernotes/StakeholdernoteForm"
import { StakeholdernoteMultiForm } from "@/src/pagesComponents/stakeholdernotes/StakeholdernoteMultiForm"
import createStakeholdernote from "@/src/server/stakeholdernotes/mutations/createStakeholdernote"
import { StakeholdernoteMultiSchema } from "@/src/server/stakeholdernotes/schema"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const NewStakeholdernotesWithQuery = () => {
  const router = useRouter()
  const [createStakeholdernoteMutation] = useMutation(createStakeholdernote)

  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()
  const [subsection] = useQuery(getSubsection, {
    projectSlug,
    subsectionSlug: subsectionSlug!,
  })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    const createStakeholderNoteArray = values.title
      .split("\n")
      .map((i: string) => i.trim())
      .filter(Boolean)
      .map((i: string) => {
        return { title: i, subsectionId: subsection.id, status: "PENDING", statusText: null }
      })

    try {
      for (const createStakeholderNoteElement of createStakeholderNoteArray) {
        await createStakeholdernoteMutation({ projectSlug, ...createStakeholderNoteElement })
      }
      await router.push(Routes.SubsectionStakeholdersPage({ projectSlug, subsectionSlug }))
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
  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewStakeholdernotesWithQuery />
      </Suspense>

      <p className="mt-5">
        <Link href={Routes.SubsectionStakeholdersPage({ projectSlug, subsectionSlug })}>
          Zurück zum Planungsabschnitt
        </Link>
      </p>
    </LayoutRs>
  )
}

NewStakeholdernotesPage.authenticate = true

export default NewStakeholdernotesPage
