import { getRouteApi } from "@tanstack/react-router"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminSurveyNewForm } from "@/src/components/admin/surveys/new/AdminSurveyNewForm"
import { shortTitle } from "@/src/components/core/components/text/titles"

const routeApi = getRouteApi("/admin/projects/$projectSlug/surveys/new/")

export function PageAdminSurveysNew() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <AdminPageHeader
        parent={{
          title: `Beteiligungen: ${shortTitle(projectSlug)}`,
          href: `/admin/projects/${projectSlug}/surveys`,
        }}
        title="Neue Beteiligung"
      />
      <AdminSurveyNewForm projectSlug={projectSlug} />
    </>
  )
}
