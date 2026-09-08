import { z } from "zod"
import { blankToNull, InputStringOrNullSchema } from "@/src/components/core/utils/schema-shared"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"

const phonePattern = /^(?=.*\d)[\d+()/\s-]+$/

const m2mFormFields = {
  tags: z.union([z.undefined(), z.boolean(), z.array(z.coerce.number())]).transform((v) => v || []),
}

export const ContactSchema = z.object({
  lastName: InputStringOrNullSchema,
  firstName: InputStringOrNullSchema,
  email: z.preprocess(blankToNull, z.email({ error: "Ungültige E-Mail-Adresse." }).nullable()),
  note: InputStringOrNullSchema,
  phone: z.preprocess(
    blankToNull,
    z
      .string()
      .regex(phonePattern, { error: "Nur Ziffern und die Zeichen + - / ( ) sind erlaubt." })
      .nullable(),
  ),
  role: InputStringOrNullSchema,
  tags: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
})

export const contactFormDefaultValues: z.infer<typeof ContactSchema> = {
  lastName: null,
  email: null,
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
