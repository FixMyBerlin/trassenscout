import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"

const m2mFormFields = {
  tags: z.union([z.undefined(), z.boolean(), z.array(z.coerce.number())]).transform((v) => v || []),
}

export const ContactSchema = z.object({
  lastName: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  firstName: z.string().nullish(),
  email: z.email({ error: "Ungültige E-Mail-Adresse." }),
  note: z.string().nullish(),
  phone: z.string().nullish(),
  role: z.string().nullish(),
  tags: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
})

export const contactFormDefaultValues: z.infer<typeof ContactSchema> = {
  lastName: "",
  email: "",
  firstName: null,
  note: null,
  phone: null,
  role: null,
  tags: [],
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

export const CreateContactSchema = ProjectSlugRequiredSchema.extend({
  ...ContactSchema.omit({ tags: true }).shape,
  ...m2mFormFields,
})

export const UpdateContactSchema = ProjectSlugRequiredSchema.extend({
  ...ContactSchema.omit({ tags: true }).shape,
  id: z.number(),
  ...m2mFormFields,
})

export const DeleteContactSchema = ProjectSlugRequiredSchema.extend({ id: z.number() })

export const GetContactsSchema = ProjectSlugRequiredSchema.extend({
  skip: z.number().int().nonnegative().optional(),
  take: z.number().int().positive().max(100).optional(),
})

export type GetContactsInput = z.infer<typeof GetContactsSchema>
