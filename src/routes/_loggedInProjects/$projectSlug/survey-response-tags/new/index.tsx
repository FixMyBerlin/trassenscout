import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageSurveyResponseTagsNew } from "@/src/components/pages/survey-response-tags/PageSurveyResponseTagsNew"
import { absoluteTitleHead } from "@/src/routeHead"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/survey-response-tags/new/")({
  head: () => absoluteTitleHead(seoNewTitle("Tag")),
  ssr: true,
  component: PageSurveyResponseTagsNew,
})
