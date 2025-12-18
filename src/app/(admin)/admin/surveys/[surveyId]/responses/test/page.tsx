import { Breadcrumb } from "@/src/app/(admin)/admin/_components/Breadcrumb"
import { HeaderWrapper } from "@/src/app/(admin)/admin/_components/HeaderWrapper"
import { invoke } from "@/src/blitz-server"
import { H2 } from "@/src/core/components/text"
import getTestSurveyResponses from "@/src/survey-responses/queries/getTestSurveyResponses"
import getAdminSurvey from "@/src/surveys/queries/getAdminSurvey"
import { Metadata } from "next"
import "server-only"
import { DeleteButton } from "./_components/DeleteButton"

export const metadata: Metadata = { title: "Beteiligung bearbeiten erstellen" }

export default async function AdminSurveyEditPage({
  params: { surveyId: surveyIdString },
}: {
  params: { surveyId: string }
}) {
  const survey = await invoke(getAdminSurvey, { id: Number(surveyIdString) })
  const testSurveyResponses = await invoke(getTestSurveyResponses, {
    slug: survey.slug,
  })

  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/surveys", name: "Beteiligungen" },
            { name: "Beteiligung: Testeinträge" },
          ]}
        />
      </HeaderWrapper>
      <H2>Testeinträge</H2>
      <p className="mb-4 italic">
        Dies sind alle Einträge, deren Hinweistext (ersten 20 Zeichen) &#39;test&#39; enthält (plus
        die jeweils dazugehörige Umfrageteil)
        {survey.slug === "radnetz-brandenburg" && " / die Institution 'FixMyCity' ist"}
      </p>
      {!testSurveyResponses.length
        ? "keine Testeinträge gefunden"
        : testSurveyResponses.map((response) => (
            <pre key={response.id}>{JSON.stringify(response, undefined, 2)}</pre>
          ))}
      {!!testSurveyResponses.length && (
        <DeleteButton
          surveySlug={survey.slug}
          testSurveyResponseIds={testSurveyResponses.map((r) => r.id)}
        />
      )}
    </>
  )
}
