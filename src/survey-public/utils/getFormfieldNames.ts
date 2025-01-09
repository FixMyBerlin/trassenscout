import { TFeedbackQuestion, TQuestion } from "../components/types"

const componentNamePrefixMap: Record<
  TQuestion["component"] | TFeedbackQuestion["component"],
  string
> = {
  multipleResponse: "multi",
  singleResponse: "single",
  text: "text", // textarea
  textfield: "text", // text input
  readOnly: "text",
  map: "map",
  custom: "custom",
}

/**
 * @desc Helper function to generate names of form fields of the public survey.
 *
 * The function constructs form field names based on the component type and question ID (both defined in the config files of the survey).
 * It uses a predefined mapping of component types to name prefixes.
 * The generated form field names are used to define and access the form values in the public survey.
 * The prefixes are used to distinguish between different types of form fields when transforming the values before submitting them to the backend.
 *
 * @param {TQuestion["component"] | TFeedbackQuestion["component"]} componentType - The type of the component.
 * @param {number} id - The ID of the question.
 * @returns {string} - The generated form field name.
 */

export const getFormfieldName = (
  componentType: TQuestion["component"] | TFeedbackQuestion["component"],
  id: number,
) => {
  const prefix = componentNamePrefixMap[componentType]
  return `${prefix}-${id}`
}

/**
 * @desc Helper function to generate form field names for an array of questions.
 * These names are used to identify form values and perform validation for a specific group of form fields.
 *
 * The function iterates over the provided questions and constructs form field names using the getFormfieldName function.
 * For "multipleResponse" components, it adds one field name per respone, including the response ID in the name.
 *
 * @param {TFeedbackQuestion[] | TQuestion[]} questions - Array of questions to generate form field names from.
 * @returns {string[]} - Array of form field names.
 */

export const getFormfieldNamesByQuestions = (questions: TFeedbackQuestion[] | TQuestion[]) => {
  const formFieldNames: string[] = []

  questions.forEach((q) => {
    if (q.component === "multipleResponse") {
      // @ts-expect-error
      q.props?.responses?.forEach((r) => {
        formFieldNames.push(`${componentNamePrefixMap[q.component]}-${q.id}-${r.id}`)
      })
    } else {
      formFieldNames.push(getFormfieldName(q.component, q.id))
    }
  })
  return formFieldNames
}
