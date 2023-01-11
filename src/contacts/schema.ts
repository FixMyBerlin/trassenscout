import { z } from "zod"

export const ContactSchema = z.object({
  name: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  email: z.string().email({ message: "Ungültige E-Mail-Adresse." }),
  title: z.string().nullish(),
  phone: z.string().nullish(),
  role: z.string().nullish(),
})
