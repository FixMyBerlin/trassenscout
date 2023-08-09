import { BlitzPage, useParam } from "@blitzjs/next"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { H2 } from "src/core/components/text"
import { ZeroCase } from "src/core/components/text/ZeroCase"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import surveyDefinition from "src/participation/data/survey.json"
import EditableSurveyResponseListItem from "src/survey-responses/components/EditableSurveyResponseListItem"
import EditableSurveyResponsesList from "src/survey-responses/components/EditableSurveyResponsesList"
import getGroupedSurveyResponses from "src/survey-responses/queries/getGroupedSurveyResponses"
import getSurvey from "src/surveys/queries/getSurvey"

export const SurveyResponse = () => {
  const { projectSlug } = useSlugs()
  const surveyId = useParam("surveyId", "number")
  const [survey] = useQuery(getSurvey, { id: surveyId })
  const [{ surveyResponsesFeedbackPart }] = usePaginatedQuery(getGroupedSurveyResponses, {
    projectSlug,
    surveyId: survey.id,
  })

  return (
    <>
      <MetaTags noindex title={`Beteiligung ${survey.title}`} />
      <PageHeader
        title={survey.title}
        className="mt-12"
        description={
          <>
            <p className="mt-5 text-base text-gray-500">
              Dieser Bereich sammelt die Ergebnisse und Berichte der Beteiligung. Hier finden sie
              die Excel Tabelle und ausgewählte Auswertungsergebnisse.
            </p>
            {survey.active && surveyDefinition.canonicalUrl && (
              <p className="text-base text-gray-500">
                Die Beteiligung ist über{" "}
                <Link blank className="!text-base" href={surveyDefinition.canonicalUrl}>
                  diese Seite
                  <ArrowTopRightOnSquareIcon className="ml-1 w-4 h-4 inline-flex mb-1" />
                </Link>{" "}
                erreichbar.
              </p>
            )}
          </>
        }
      />

      <div className="space-y-4 mt-12">
        <H2>Kommentare aus Bürgerbeteiligung</H2>

        <ZeroCase visible={surveyResponsesFeedbackPart.length} name={"Beiträge"} />
        <EditableSurveyResponsesList responses={surveyResponsesFeedbackPart} />

        <code>{JSON.stringify(surveyResponsesFeedbackPart)}</code>
      </div>
    </>
  )
}

const SurveyResponsePage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <SurveyResponse />
      </Suspense>
    </LayoutRs>
  )
}

SurveyResponsePage.authenticate = true

export default SurveyResponsePage
