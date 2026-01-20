import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import getSurveys from "@/src/server/surveys/queries/getSurveys"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import "server-only"
import { surveyHref, surveyResponsesHref } from "./_utils/SurveyHrefs"

export const metadata: Metadata = {
  title: "Beteiligungen",
  robots: "noindex",
}

export default async function SurveysPage({ params }: { params: { projectSlug: string } }) {
  const { surveys } = await invoke(getSurveys, { projectSlug: params.projectSlug })

  if (!surveys.length) {
    return (
      <>
        <PageHeader title="Beteiligungen" className="mt-12" />
        <ZeroCase visible={0} name="Beteiligungen" />
      </>
    )
  }

  // Navigation always links to /survey. But this redirects to the survey Page when only one is present.
  if (surveys.length === 1) {
    redirect(surveyResponsesHref(params.projectSlug, surveys[0]!.id))
  }

  return (
    <>
      <PageHeader title="Beteiligungen" className="mt-12" />
      <div className="flex flex-col gap-4">
        {surveys.map((survey) => (
          <Link key={survey.id} href={surveyHref(params.projectSlug, survey.id)}>
            {survey.title}
          </Link>
        ))}
      </div>
    </>
  )
}
