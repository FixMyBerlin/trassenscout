import { useSearch } from "@tanstack/react-router"
import { useEffect } from "react"
import { SurveyMainPage } from "@/src/components/beteiligung/SurveyMainPage"
import communes_bboxes from "@/src/components/beteiligung/surveys/ohv-haltestellenfoerderung/communes_bboxes.json"
type Props = {
  surveyId: number
}

export const SurveyOhvHaltestellenfoerderung = ({ surveyId }: Props) => {
  const search = useSearch({ from: "/beteiligung/$surveySlug/" })
  const id = search.id || "unbekannt"
  const commune = communes_bboxes.find((i) => i.id === id)?.name || "unbekannt"

  // in survey ohv, the commune id is passed as a query parameter in the original url sent to the user
  // the commune name should appear in the survey response
  // we need to update the query parameter here to include the commune name (we get it from the communes_bboxes by the commune id)
  // the ReadOnlyTextfield gets the commune name from the url, displays it and saves it in the survey response

  useEffect(
    function syncCommuneSearchParams() {
      const url = new URL(window.location.href)
      url.searchParams.set("id", id)
      url.searchParams.set("commune", commune)
      window.history.replaceState({}, "", url)
    },
    [commune, id],
  )

  return <SurveyMainPage surveyId={surveyId} />
}
