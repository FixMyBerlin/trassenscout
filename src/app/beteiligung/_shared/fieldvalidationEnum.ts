import { z } from "zod"

// todo maybe make this a function so that we can pass min max, required... values?
export const fieldValidationEnum = {
  optionalString: { zodSchema: z.string().optional(), required: false },
  requiredString: {
    zodSchema: z.string({ message: "Pflichtfeld." }).trim().min(1, { message: "Pflichtfeld." }),
    required: true,
  },
  requiredEmailString: {
    zodSchema: z
      .string({ message: "Pflichtfeld." })
      .trim()
      .min(1, { message: "Pflichtfeld." })
      .email({ message: "Bitte eine gültige E-Mail-Adresse eingeben." }),
    required: true,
  },
  // the optional zod schema with "required: true" seems contradictory, but it is used for a field that is required, but only if a condition is met
  // the conditional required validation is handled in the form field logic manually - defined in the config
  // we want to have "required: true" so that the field is marked as required in the UI
  conditionalRequiredString: {
    zodSchema: z.string().optional(),
    required: true,
  },
  conditionalOptionalString: {
    zodSchema: z.string().optional(),
    required: false,
  },
  optionalArrayOfString: { zodSchema: z.array(z.string()), required: false },
  requiredArrayOfString: {
    zodSchema: z.array(z.string()).nonempty({ message: "Pflichtfeld." }),
    required: true,
  },
  requiredArrayOfStringMin2: {
    zodSchema: z.array(z.string()).min(2, { message: "Bitte mindestens 2 Antworten auswählen" }),
    required: true,
  },
  optionalArrayOfStringMax3: {
    zodSchema: z.array(z.string()).max(3, { message: "Bitte maximal 3 Antworten auswählen" }),
    required: false,
  },

  requiredBoolean: { zodSchema: z.boolean(), required: true },
  requiredTrueBoolean: {
    zodSchema: z.literal(true, { errorMap: () => ({ message: "Pflichtfeld." }) }),
    required: true,
  },

  conditionalRequiredLatLng: {
    zodSchema: z.object({ lat: z.number(), lng: z.number() }).nullish(),
    required: true,
  },
  requiredLatLng: {
    zodSchema: z.object({ lat: z.number(), lng: z.number() }),
    required: true,
  },
  optionalArrayOfNumber: {
    zodSchema: z.array(z.coerce.number()),
    required: false,
  },
  requiredArrayOfNumber: {
    zodSchema: z.array(z.coerce.number()).nonempty({ message: "Pflichtfeld." }),
    required: true,
  },
}
