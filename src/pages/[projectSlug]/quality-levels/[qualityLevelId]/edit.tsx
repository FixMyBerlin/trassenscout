import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { QualityLevelForm } from "@/src/pagesComponents/qualityLevels/QualityLevelForm"
import updateQualityLevel from "@/src/server/qualityLevels/mutations/updateQualityLevel"
import getQualityLevel from "@/src/server/qualityLevels/queries/getQualityLevel"
import { QualityLevelSchema } from "@/src/server/qualityLevels/schema"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const EditQualityLevelWithQuery = () => {
  const router = useRouter()
  const qualityLevelId = useParam("qualityLevelId", "number")
  const projectSlug = useProjectSlug()

  const [qualityLevel, { setQueryData }] = useQuery(
    getQualityLevel,
    { projectSlug, id: qualityLevelId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateQualityLevelMutation] = useMutation(updateQualityLevel)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateQualityLevelMutation({
        ...values,
        id: qualityLevel.id,
        projectSlug,
      })
      await setQueryData(updated)
      await router.push(Routes.QualityLevelsPage({ projectSlug }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <QualityLevelForm
        className="grow"
        submitText="Speichern"
        schema={QualityLevelSchema}
        initialValues={qualityLevel}
        onSubmit={handleSubmit}
      />

      <p className="mt-5">
        <Link href={Routes.QualityLevelsPage({ projectSlug })}>Zurück zur Übersicht</Link>
      </p>

      <SuperAdminLogData data={{ qualityLevel }} />
    </>
  )
}

const EditQualityLevelPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Ausbaustandard")} />
      <PageHeader title="Ausbaustandard bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditQualityLevelWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

EditQualityLevelPage.authenticate = true

export default EditQualityLevelPage
