import { z } from "zod"

export const ContactSchema = z.object({
  lastName: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  firstName: z.string().nullish(),
  email: z.string().email({ message: "Ungültige E-Mail-Adresse." }),
  note: z.string().nullish(),
  phone: z.string().nullish(),
  role: z.string().nullish(),
})

/** Empty form state for AppField typing + `form.reset()`. Annotated so all keys stay required for TanStack. */
export const contactFormDefaultValues: z.infer<typeof ContactSchema> = {
  lastName: "",
  email: "",
  firstName: null,
  note: null,
  phone: null,
  role: null,
}

export const ContactTableFormSchema = z.object({
  selectedContacts: z.array(z.string()),
})

/** Empty form state for AppField typing + `form.reset()`. */
export const contactTableFormDefaultValues: z.infer<typeof ContactTableFormSchema> = {
  selectedContacts: [],
}
