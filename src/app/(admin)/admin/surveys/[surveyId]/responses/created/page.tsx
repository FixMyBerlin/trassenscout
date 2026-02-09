import { Breadcrumb } from "@/src/app/(admin)/admin/_components/Breadcrumb"
import { HeaderWrapper } from "@/src/app/(admin)/admin/_components/HeaderWrapper"
import { invoke } from "@/src/blitz-server"
import { H2 } from "@/src/core/components/text"
import getCreatedSurveyResponses from "@/src/server/survey-responses/queries/getCreatedSurveyResponses"
import getAdminSurvey from "@/src/server/surveys/queries/getAdminSurvey"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = { title: "Beteiligung: Created Responses" }

export default async function AdminSurveyCreatedResponsesPage({
  params: { surveyId: surveyIdString },
}: {
  params: { surveyId: string }
}) {
  const survey = await invoke(getAdminSurvey, { id: Number(surveyIdString) })
  const createdResponses = await invoke(getCreatedSurveyResponses, { slug: survey.slug })

  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/surveys", name: "Beteiligungen" },
            { name: "Beteiligung: Nicht-abgeschickte Einträge" },
          ]}
        />
      </HeaderWrapper>
      <H2>Nicht-abgeschickte Beteiligungsantworten</H2>
      <p className="mb-4 italic">Dies sind alle Einträge, deren Status CREATED ist.</p>
      {!createdResponses.length
        ? "keine CREATED SurveyResponses gefunden"
        : createdResponses.map((response) => (
            <pre key={response.id}>{JSON.stringify(response, undefined, 2)}</pre>
          ))}
    </>
  )
}
