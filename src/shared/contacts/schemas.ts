import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"

export const ContactSchema = z.object({
  lastName: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  firstName: z.string().nullish(),
  email: z.email({ error: "Ungültige E-Mail-Adresse." }),
  note: z.string().nullish(),
  phone: z.string().nullish(),
  role: z.string().nullish(),
})

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

export const contactTableFormDefaultValues: z.infer<typeof ContactTableFormSchema> = {
  selectedContacts: [],
}

export const GetContactSchema = ProjectSlugRequiredSchema.extend({
  id: z.number(),
})

export const CreateContactSchema = ProjectSlugRequiredSchema.extend(ContactSchema.shape)

export const UpdateContactSchema = ProjectSlugRequiredSchema.extend({
  ...ContactSchema.shape,
  id: z.number(),
})

export const DeleteContactSchema = ProjectSlugRequiredSchema.extend({ id: z.number() })

export const GetContactsSchema = ProjectSlugRequiredSchema.extend({
  skip: z.number().int().nonnegative().optional(),
  take: z.number().int().positive().max(100).optional(),
})

export type GetContactsInput = z.infer<typeof GetContactsSchema>
