import { z } from "zod"

export const ContactSchema = z.object({
  lastName: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  firstName: z.string().nullish(),
  email: z.string().email({ message: "Ungültige E-Mail-Adresse." }),
  note: z.string().nullish(),
  phone: z.string().nullish(),
  role: z.string().nullish(),
  projectId: z.coerce.number(),
})
