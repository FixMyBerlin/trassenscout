import { z } from "zod"

// todo maybe make this a function so that we can pass min max, required... values?
export const fieldValidationEnum = {
  optionalString: { zodSchema: z.string().optional(), required: false },
  requiredString: {
    zodSchema: z.string({ message: "Pflichtfeld." }).trim().min(1, { message: "Pflichtfeld." }),
    required: true,
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

  requiredLatLng: { zodSchema: z.object({ lat: z.number(), lng: z.number() }), required: true },
}
