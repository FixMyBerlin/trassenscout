import { z } from "zod"
import { TFeedbackQuestion, TQuestion, TSingleOrMultiResponseProps } from "../components/types"

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

export const createSurveySchema = (questions?: TQuestion[] | TFeedbackQuestion[]) => {
  if (!questions?.length) return z.object({})
  const schemaObject: Record<string, any> = {}
  // const multipleResponseKeys: string[] = []

  questions.forEach((q) => {
    const { id, props, component } = q
    // @ts-expect-error
    const validation = props?.validation || undefined
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
              schemaObject[`text-${id}`] = customEmailZodSchema
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
              schemaObject[`text-${id}`] = customTextZodSchema
              break
          }
        } else {
          schemaObject[`text-${id}`] = defaultZodSchema.text
        }
        break
      case "readOnly": // input type text but read only
        schemaObject[`text-${id}`] = validation?.optional
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
          schemaObject[`text-${id}`] = customTextareaZodSchmema
        } else {
          schemaObject[`text-${id}`] = defaultZodSchema.textarea
        }
        break
      case "singleResponse":
        schemaObject[`single-${id}`] = validation?.optional
          ? z.string({ message: "Pflichtfeld." }).trim().nullish().or(z.literal(""))
          : defaultZodSchema.single
        break
      case "multipleResponse":
        const multiResponseProps = props as TSingleOrMultiResponseProps
        multiResponseProps.responses.forEach((r) => {
          const key = `multi-${id}-${r.id}`
          schemaObject[key] = z.boolean()
          // Add key to multipleResponseKeys if not optional
          // if it is optional we do not need to validate if one of the options is selected
          // if (!validation?.optional) multipleResponseKeys.push(key)
        })

        break
      case "custom":
        schemaObject[`custom-${id}`] = z.union([
          z.string({ required_error: "Pflichtfeld." }).trim().min(1, { message: "Pflichtfeld." }),
          z.number({ required_error: "Pflichtfeld." }),
          z.boolean({ required_error: "Pflichtfeld." }),
          z.object({}, { required_error: "Pflichtfeld." }).passthrough(),
          z.array(z.any({ required_error: "Pflichtfeld." })),
        ])
        break
      case "map":
        schemaObject[`map-${id}`] = z.object(
          {
            lng: z.number(),
            lat: z.number(),
          },
          { required_error: "Pflichtfeld." },
        )
        break
    }
  })

  return z.object(schemaObject)

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
