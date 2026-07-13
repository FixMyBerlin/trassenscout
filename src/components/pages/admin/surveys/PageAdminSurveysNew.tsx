import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminSurveyNewForm } from "@/src/components/admin/surveys/new/AdminSurveyNewForm"

export function PageAdminSurveysNew() {
  return (
    <>
      <AdminPageHeader
        parent={{ title: "Beteiligungen (alle)", href: "/admin/surveys" }}
        title="Neue Beteiligung"
      />
      <AdminSurveyNewForm />
    </>
  )
}
