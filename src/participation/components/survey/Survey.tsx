import { useContext, useEffect, useState } from "react"
import { Form } from "src/core/components/forms"
import { ProgressContext } from "src/pages/beteiligung"

export { FORM_ERROR } from "src/core/components/forms"

import { Page, TPage } from "./Page"
import { pinkButtonStyles } from "../../../core/components/links"

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
  const [values, setValues] = useState({})
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

  const transformValues = (values: Record<string, null | string | boolean>) => {
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
    return responses
  }

  const handleSubmit = (values) => {
    onSubmit(Object.entries(transformValues(values)).map(([k, v]) => [Number(k), v]))
  }

  const handleChange = (values) => {
    values = transformValues(values)
    setValues(values)
  }

  const pageIsComplete = () => {
    let completed: boolean
    const questions = pages[pageProgress]!.questions

    if (!questions || !questions.length) {
      completed = true
    } else {
      // @ts-ignore every() returns a boolean
      completed = pages[pageProgress]!.questions?.every(({ id, component }) => {
        if (!(id in values)) {
          return false
        }
        // @ts-ignore no worries - this works
        const response = values[id]
        if (["singleResponse", "text"].includes(component)) {
          return response !== null
        } else {
          return !!response.length
        }
      })
    }
    return completed
  }

  const page = pages[pageProgress]

  return (
    <Form submitClassName={pinkButtonStyles} onSubmit={handleSubmit} onChangeValues={handleChange}>
      <code>
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </code>
      <Page page={page} buttonActions={buttonActions} completed={pageIsComplete()} />
    </Form>
  )
}
