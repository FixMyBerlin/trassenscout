import { InputNumberOrNullSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

// tbd mimeType
// atm we rely on browser-provided MIME type when uploading files
// and email parser's contentType for email attachments
// We would need a package like file-type package if:
// Users are uploading files with incorrect/missing MIME types (rare in modern browsers)
// You want server-side validation to prevent malicious file type spoofing
// You're processing files from untrusted sources without MIME type info

export const UploadSchema = z.object({
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  summary: z.string().nullable(),
  subsectionId: InputNumberOrNullSchema,
  projectRecordEmailId: InputNumberOrNullSchema,
  subsubsectionId: InputNumberOrNullSchema, // TODO Make this more fancy and guard against a case where both subsectionId and subsubsectionId are given
  externalUrl: z.string().url(),
  mimeType: z.string().nullable().optional(),
  fileSize: z.number().int().positive().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  collaborationUrl: z.string().url().nullable().optional(),
  collaborationPath: z.string().nullable().optional(),
  // m2mFields
  projectRecords: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
})

export const UploadFormSchema = UploadSchema.omit({
  projectRecords: true,
}).merge(
  z.object({
    // LIST ALL m2mFields HERE
    // We need to do this manually, since dynamic zod types don't work
    projectRecords: z
      .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
      .transform((v) => v || []),
  }),
)

type TUploadSchema = z.infer<typeof UploadSchema>
