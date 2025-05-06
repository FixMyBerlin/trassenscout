import { AdminSurveyResponses } from "@/src/app/admin/surveys/_components/SurveyResponses"
import { AdminSurveyResponsesNew } from "@/src/app/admin/surveys/_components/SurveyResponsesNew"
import { invoke } from "@/src/blitz-server"
import getAdminProject from "@/src/server/projects/queries/getAdminProject"
import getAdminSurvey from "@/src/surveys/queries/getAdminSurvey"
import { Metadata } from "next"
import "server-only"
import { Breadcrumb } from "../../../_components/Breadcrumb"
import { HeaderWrapper } from "../../../_components/HeaderWrapper"

export const metadata: Metadata = { title: "Beiträge" }

export default async function AdminSurveyResponsesPage({
  params: { surveyId: surveyIdString },
}: {
  params: { surveyId: string }
}) {
  const surveyId = Number(surveyIdString)
  const survey = await invoke(getAdminSurvey, { id: surveyId })
  const project = await invoke(getAdminProject, { id: survey.projectId })

  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/surveys", name: "Beteiligungen" },
            { name: "Beteiligung" },
            { name: `Beiträge für ${survey.title}` },
          ]}
        />
      </HeaderWrapper>

      <article className="bg-white p-5">
        <h2>{survey.title}</h2>
        {(survey.slug === "rs8" ||
          survey.slug === "frm7" ||
          survey.slug === "radnetz-brandenburg") && (
          <AdminSurveyResponses project={project} surveyId={surveyId} survey={survey} />
        )}
        {(survey.slug === "rstest" ||
          survey.slug === "frm7-neu" ||
          survey.slug === "rstest-2-3") && (
          <AdminSurveyResponsesNew project={project} surveyId={surveyId} survey={survey} />
        )}
      </article>
    </>
  )
}
