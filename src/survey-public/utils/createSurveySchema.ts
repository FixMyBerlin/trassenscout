import { z } from "zod"
import { TFeedbackQuestion, TQuestion, TSingleOrMultiResponseProps } from "../components/types"
import { getFormfieldName } from "./getFormfieldNames"

const defaultZodSchema = {
  text: z
    .string()
    .trim()
    // empty string is not allowed
    .min(1, { message: "Pflichtfeld." })
    .max(1000, { message: "Maximal 1000 Zeichen." }),
  textarea: z
    .string()
    .trim()
    .min(1, { message: "Pflichtfeld." })
    .max(5000, { message: "Maximal 5000 Zeichen." }),
  single: z.string({ message: "Pflichtfeld." }).trim().min(1, { message: "Pflichtfeld." }),
  multi: z.array(z.string()).nonempty({
    message: "Pflichtfeld.",
  }),
}

/**
 * @desc The function creates a Zod schema based on provided questions to validate inputs in a public survey form.
 * Generates several different Zod schemas for a single form to validate inputs of every screen/"page".
 *
 * Dynamic Construction:
 * Constructs a Zod schema based on the provided questions and their component type and validation properties,
 * which are configured in the respective configuration files of the surveys in `src/survey-public/{surveySlug}`
 * (at the moment these files are named survey.ts and feedback.ts).
 * The object keys of the schema are constructed based on the component type and the question id by the helper function getFormfieldName.
 *
 * Component Types:
 * The function supports questions with component types: "singleResponse" | "multipleResponse" | "textfield" | "readOnly" | "text" | "custom" | "map".
 * The function iterates over each question to build the schema based on the component type and validation properties.
 * If no validation properties are provided, the function uses default validation properties. (see defaultZodSchema)
 * Different component types allow different validation properties: see `src/survey-public/components/types.ts`
 *
 * Optional Fields:
 * Fields are required by default unless the `optional` property of the validation object is set to true.
 * Exception is the multipleResponse field, that can only be optional at the moment. This is a limitation of the current implementation.
 * see https://github.com/FixMyBerlin/private-issues/issues/1710
 *
 * @param {TQuestion[] | TFeedbackQuestion[]} questions - Array of questions to generate the schema from.
 * @returns {z.ZodObject} - The constructed schema object as a Zod object.
 */

export const createSurveySchema = (questions?: TQuestion[] | TFeedbackQuestion[]) => {
  if (!questions?.length) return z.object({})
  const schemaObject: Record<string, any> = {}
  // const multipleResponseKeys: string[] = []

  questions.forEach((q) => {
    const { id, props, component } = q
    // @ts-expect-error
    const validation = props?.validation || undefined
    const formfieldName = getFormfieldName(component, id)

    switch (component) {
      case "textfield": // input type text
        if (validation) {
          switch (validation.type) {
            case "email":
              let customEmailZodSchema = z.string().email({
                message: "Ungültige E-Mail-Adresse",
              })
              if (validation?.optional) {
                // @ts-expect-error this works // to do validtion ?
                customEmailZodSchema = customEmailZodSchema.nullish().or(z.literal(""))
              }
              schemaObject[formfieldName] = customEmailZodSchema
              break
            case "text":
            default:
              let customTextZodSchema = z
                .string()
                .trim()
                .max(validation.maxLength || 1000, {
                  message: `Maximal ${validation.maxLength || 1000} Zeichen.`,
                })
              if (validation.minLength) {
                customTextZodSchema = customTextZodSchema.min(validation.minLength, {
                  message: `Mindestens ${validation.minLength} Zeichen.`,
                })
              }
              if (!validation.minLength && !validation?.optional) {
                customTextZodSchema = customTextZodSchema.min(1, {
                  message: `Pflichtfeld.`,
                })
              }
              if (validation.regex) {
                customTextZodSchema = customTextZodSchema.regex(validation.regex, {
                  message: "Ungültige Eingabe.",
                })
              }
              schemaObject[formfieldName] = customTextZodSchema
              break
          }
        } else {
          schemaObject[formfieldName] = defaultZodSchema.text
        }
        break
      case "readOnly": // input type text but read only
        schemaObject[formfieldName] = validation?.optional
          ? defaultZodSchema.text.nullish().or(z.literal(""))
          : defaultZodSchema.text
        break
      case "text": // input type textarea
        if (validation) {
          let customTextareaZodSchmema = z
            .string()
            .trim()
            .max(validation.maxLength || 10000, {
              message: `Die maximale Zeichenanzahl von ${validation.maxLength || 10000} Zeichen ist überschritten. Bitte kürzen Sie Ihren Text entsprechend, um fortzufahren.`,
            })
          if (validation.minLength) {
            customTextareaZodSchmema = customTextareaZodSchmema.min(validation.minLength, {
              message: `Mindestens ${validation.minLength} Zeichen.`,
            })
          }
          if (!validation.minLength && !validation?.optional) {
            customTextareaZodSchmema = customTextareaZodSchmema.min(1, {
              message: `Pflichtfeld.`,
            })
          }
          if (validation?.optional) {
            // @ts-expect-error this works // to do validtion ?
            customTextareaZodSchmema = customTextareaZodSchmema.nullish().or(z.literal(""))
          }
          schemaObject[formfieldName] = customTextareaZodSchmema
        } else {
          schemaObject[formfieldName] = defaultZodSchema.textarea
        }
        break
      case "singleResponse":
        schemaObject[formfieldName] = validation?.optional
          ? z.string({ message: "Pflichtfeld." }).trim().nullish().or(z.literal(""))
          : defaultZodSchema.single
        break
      case "multipleResponse":
        const multiResponseProps = props as TSingleOrMultiResponseProps
        multiResponseProps.responses.forEach((r) => {
          const key = `${formfieldName}-${r.id}`
          schemaObject[key] = z.boolean()
          // Add key to multipleResponseKeys if not optional
          // if it is optional we do not need to validate if one of the options is selected
          // if (!validation?.optional) multipleResponseKeys.push(key)
        })

        break
      case "custom":
        schemaObject[formfieldName] = z.union([
          z.string({ required_error: "Pflichtfeld." }).trim().min(1, { message: "Pflichtfeld." }),
          z.number({ required_error: "Pflichtfeld." }),
          z.boolean({ required_error: "Pflichtfeld." }),
          z.object({}, { required_error: "Pflichtfeld." }).passthrough(),
          z.array(z.any({ required_error: "Pflichtfeld." })),
        ])
        break
      case "map":
        schemaObject[formfieldName] = z
          .object({
            lng: z.number(),
            lat: z.number(),
          })
          .nullish()
        break
    }
  })
  return z.object(schemaObject)

  // todo validation: multipleResponse validation
  // see https://github.com/FixMyBerlin/private-issues/issues/1710
  // if (!multipleResponseKeys?.length)

  // // Add custom validation for multipleResponse fields
  // const refinedSchema = z
  //   .object(schemaObject)
  //   // partial is used to allow for partial validation ; without partial refine() would require all fields to be present before refine function is called
  //   .partial()
  //   // @ts-expect-error type todo
  //   .refine(
  //     (data) => {
  //       const multipleResponseGroups = {}

  //       // Group multipleResponse keys by their question id
  //       multipleResponseKeys.forEach((key) => {
  //         const [prefix, id] = key.split("-").slice(0, 2)
  //         const groupKey = `${prefix}-${id}`
  //         // @ts-expect-error index type
  //         if (!multipleResponseGroups[groupKey]) {
  //           // @ts-expect-error index type
  //           multipleResponseGroups[groupKey] = []
  //         }
  //         // @ts-expect-error index type
  //         multipleResponseGroups[groupKey].push(key)
  //       })

  //       // Check that at least one value in each group is true if not optional
  //       // not really what we want
  //       const isValid = Object.entries(multipleResponseGroups).every(([groupKey, keys]) => {
  //         // @ts-expect-error type todo
  //         return keys.some((key) => data[key] === true)
  //       })

  //       console.log("Validation result:", isValid)
  //       return isValid
  //     },
  //     {
  //       message: "Bitte wählen Sie mindestens eine Antwort aus.",
  //       // todo validation: the error returned is a nested object, to access the message we just take the first key
  //       // but this is a hacky solution; after the refactor this might be handled differently
  //       path: [multipleResponseKeys[0]],
  //     },
  //   )

  // return refinedSchema
}
