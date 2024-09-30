import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/hooks"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { FORM_ERROR, QualityLevelForm } from "@/src/qualityLevels/components/QualityLevelForm"
import updateQualityLevel from "@/src/qualityLevels/mutations/updateQualityLevel"
import getQualityLevel from "@/src/qualityLevels/queries/getQualityLevel"
import { QualityLevelSchema } from "@/src/qualityLevels/schema"
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
        id: qualityLevel.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(Routes.QualityLevelsPage({ projectSlug: projectSlug! }))
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
        <Link href={Routes.QualityLevelsPage({ projectSlug: projectSlug! })}>
          Zurück zur Übersicht
        </Link>
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
