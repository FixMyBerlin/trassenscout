import { TQuestion, TSurvey } from "src/survey-public/components/types"
import { T } from "vitest/dist/types-198fd1d9"

type QuestionObject = {
  id: number
  label: string
  component: "singleResponse" | "multipleResponse"
  props: { responses: { id: number; text: string }[] }
}

const transformMultiAndSingleQuestion = (question: TQuestion): QuestionObject => {
  return {
    id: question.id,
    label: question.label.de,
    // @ts-expect-error
    // for the charts we only want the multi and single response questions to be displayed, we know that the component is either singleResponse or multipleResponse
    component: question.component,
    props: {
      // @ts-expect-error
      // for the charts we only want the multi and single response questions to be displayed, they always have responses
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
        // for the charts we only want the multi and single response questions to be displayed
        if (!(question.component === "singleResponse" || question.component === "multipleResponse"))
          return
        return transformMultiAndSingleQuestion(question)
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
      return transformMultiAndSingleQuestion(question)
    })
    .filter(Boolean)
  transformedArray.push(...transformedQuestions)
  return transformedArray
}
