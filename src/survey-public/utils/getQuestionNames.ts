import { TFeedbackQuestion, TQuestion } from "../components/types"

export const getQuestionNames = (questions: TFeedbackQuestion[] | TQuestion[]) => {
  const questionNames: string[] = []

  questions.forEach((q) => {
    switch (q.component) {
      case "multipleResponse":
        // @ts-expect-error
        q.props?.responses?.forEach((r) => {
          questionNames.push(`multi-${q.id}-${r.id}`)
        })
      case "singleResponse":
        return questionNames.push(`single-${q.id}`)
      case "text":
      case "textfield":
      case "readOnly":
        return questionNames.push(`text-${q.id}`)
      case "map":
        return questionNames.push(`map-${q.id}`)
      case "custom":
      default:
        return questionNames.push(`custom-${q.id}`)
    }
  })
  return questionNames
}
