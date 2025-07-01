"use client"
import { SurveyMainPage } from "@/src/app/beteiligung/_components/SurveyMainPage"
import communes_bboxes from "@/src/app/beteiligung/_ohv-haltestellenfoerderung/communes_bboxes.json"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
type Props = {
  surveyId: number
}

export const SurveyOhvHaltestellenfoerderung = ({ surveyId }: Props) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams?.get("id") || "unbekannt"
  console.log({ router })
  console.log(searchParams?.values())
  const commune = communes_bboxes.find((i) => i.id === id)?.name || "unbekannt"

  // in survey ohv, the commune id is passed as a query parameter in the original url sent to the user
  // the commune name should appear in the survey response
  // we need to update the query parameter here to include the commune name (we get it from the communes_bboxes by the commune id)
  // the ReadOnlyTextfield gets the commune name from the url, displays it and saves it in the survey response

  useEffect(() => {
    void router.replace(`?id=${id}&commune=${encodeURIComponent(commune)}`, {
      scroll: false,
    })
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commune, id])

  return <SurveyMainPage surveyId={surveyId} />
}
