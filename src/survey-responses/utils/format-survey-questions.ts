import { TQuestion, TSurvey } from "src/survey-public/components/types"

type QuestionObject = {
  id: number
  label: string
  component: "singleResponse" | "multipleResponse" | "text"
  props: { responses: { id: number; text: string }[] }
}

const transformQuestion = (question: TQuestion): QuestionObject => {
  return {
    id: question.id,
    label: question.label.de,
    component: question.component,
    props: {
      responses: question.props.responses.map((response) => {
        return {
          id: response.id,
          text: response.text.de,
        }
      }),
    },
  }
}

export const extractAndTransformQuestionsFromPages = (
  pages: TSurvey["pages"],
): QuestionObject[] => {
  const transformedArray: QuestionObject[] = []

  pages.forEach((page) => {
    if (!page.questions || page.questions.length === 0) return

    const transformedQuestions = page.questions
      .map((question) => {
        if (!("responses" in question.props)) return
        return transformQuestion(question)
      })
      .filter(Boolean)
    transformedArray.push(...transformedQuestions)
  })
  return transformedArray
}

export const transformDeletedQuestions = (questions: TQuestion[]): QuestionObject[] => {
  const transformedArray: QuestionObject[] = []
  const transformedQuestions = questions
    .map((question) => {
      if (!("responses" in question.props)) return
      return transformQuestion(question)
    })
    .filter(Boolean)
  transformedArray.push(...transformedQuestions)
  return transformedArray
}
