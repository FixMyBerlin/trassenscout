import { useContext, useEffect, useState } from "react"
import { Form } from "src/core/components/forms"
import { ProgressContext } from "src/pages/beteiligung"

export { FORM_ERROR } from "src/core/components/forms"

import { Page, TPage } from "./Page"

type Props = { survey: TSurvey; onSubmit: ([]) => void }

export type TSurvey = {
  id: number
  title: { de: string }
  createdAt: string
  version: number
  pages: TPage[]
}

export const Survey: React.FC<Props> = ({ survey, onSubmit }) => {
  const [pageProgress, setPageProgress] = useState(0)
  const { progress, setProgress } = useContext(ProgressContext)
  useEffect(() => {
    setProgress({ ...progress, total: pages.length })
  }, [])

  const handleNextPage = () => {
    const newPageProgress = Math.min(pages.length - 1, pageProgress + 1)
    setPageProgress(newPageProgress)
    window && window.scrollTo(0, 0)
    console.log(newPageProgress)
  }
  const handleBackPage = () => {
    const newPageProgress = Math.max(0, pageProgress - 1)
    setPageProgress(newPageProgress)
    window && window.scrollTo(0, 0)
    console.log(newPageProgress)
  }

  const handleReset = () => {
    // setProgress(1)
    // setSurveyResponses([])
  }

  const buttonActions = {
    next: handleNextPage,
    back: handleBackPage,
    reset: handleReset,
    submit: () => {},
  }

  const { pages } = survey

  const handleSubmit = (values: Record<string, null | string | boolean>) => {
    const responses: Record<string, null | string | number | number[]> = {}
    Object.entries(values).forEach(([k, v]) => {
      const [questionType, questionId, responseId] = k.split("-")
      switch (questionType) {
        case "single":
          responses[questionId!] = v === null ? null : Number(v)
          break
        case "multi":
          if (!(questionId! in responses)) responses[questionId!] = []
          // @ts-ignore
          if (v) responses[questionId!].push(Number(responseId))
          break
        case "text":
          responses[questionId!] = v === "" ? null : String(v)
          break
      }
    })
    onSubmit(Object.entries(responses).map(([k, v]) => [Number(k), v]))
  }

  const page = pages[pageProgress]

  return (
    <Form onSubmit={handleSubmit}>
      <Page page={page} buttonActions={buttonActions} />
    </Form>
  )
}
