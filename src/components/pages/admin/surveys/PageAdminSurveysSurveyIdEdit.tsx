import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminSurveyEditForm } from "@/src/components/admin/surveys/[surveyId]/edit/AdminSurveyEditForm"
import { Spinner } from "@/src/components/core/components/Spinner"
import { shortTitle } from "@/src/components/core/components/text/titles"

const routeApi = getRouteApi("/admin/projects/$projectSlug/surveys/$surveyId/edit/")

export function PageAdminSurveysSurveyIdEdit() {
  const { projectSlug, surveyId } = routeApi.useParams()

  return (
    <>
      <AdminPageHeader
        parent={{
          title: `Beteiligungen: ${shortTitle(projectSlug)}`,
          href: `/admin/projects/${projectSlug}/surveys`,
        }}
        title={`Beteiligung ${surveyId}`}
      />
      <Suspense fallback={<Spinner page />}>
        <AdminSurveyEditForm projectSlug={projectSlug} surveyId={Number(surveyId)} />
      </Suspense>
    </>
  )
}
