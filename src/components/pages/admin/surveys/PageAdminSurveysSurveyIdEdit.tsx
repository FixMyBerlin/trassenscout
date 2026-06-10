import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminSurveyEditForm } from "@/src/components/admin/surveys/[surveyId]/edit/AdminSurveyEditForm"
import { Spinner } from "@/src/components/core/components/Spinner"

const routeApi = getRouteApi("/admin/surveys/$surveyId/edit/")

export function PageAdminSurveysSurveyIdEdit() {
  const { surveyId } = routeApi.useParams()
  return (
    <>
      <AdminPageHeader
        parent={{ title: "Beteiligungen (alle)", href: "/admin/surveys" }}
        title={`Beteiligung ${surveyId}`}
      />
      <Suspense fallback={<Spinner page />}>
        <AdminSurveyEditForm surveyId={Number(surveyId)} />
      </Suspense>
    </>
  )
}
