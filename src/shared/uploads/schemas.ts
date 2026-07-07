import { z } from "zod"
import { InputNumberOrNullSchema } from "@/src/components/core/utils/schema-shared"

// tbd mimeType
// atm we rely on browser-provided MIME type when uploading files
// and email parser's contentType for email attachments
// We would need a package like file-type package if:
// Users are uploading files with incorrect/missing MIME types (rare in modern browsers)
// You want server-side validation to prevent malicious file type spoofing
// You're processing files from untrusted sources without MIME type info

const m2mFormFields = {
  projectRecords: z
    .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
    .transform((v) => v || []),
  subsubsections: z
    .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
    .transform((v) => v || []),
  acquisitionAreas: z
    .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
    .transform((v) => v || []),
  tags: z.union([z.undefined(), z.boolean(), z.array(z.coerce.number())]).transform((v) => v || []),
}

export const UploadSchema = z.object({
  title: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  summary: z.string().nullable(),
  projectRecordEmailId: InputNumberOrNullSchema,
  surveyResponseId: InputNumberOrNullSchema,
  externalUrl: z.url(),
  mimeType: z.string().nullable().optional(),
  fileSize: z.number().int().positive().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  collaborationUrl: z.url().nullable().optional(),
  collaborationPath: z.string().nullable().optional(),
  projectRecords: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
  subsubsections: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
  acquisitionAreas: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
  tags: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
})

export const uploadFormDefaultValues = {
  title: "",
  summary: null as string | null,
  externalUrl: "",
  projectRecordEmailId: null as number | null,
  surveyResponseId: null as number | null,
  mimeType: null as string | null,
  fileSize: null as number | null,
  latitude: null as number | null,
  longitude: null as number | null,
  collaborationUrl: null as string | null,
  collaborationPath: null as string | null,
  projectRecords: [] as number[],
  subsubsections: [] as string[],
  acquisitionAreas: [] as string[],
  tags: [] as string[],
}

export const UploadFormSchema = UploadSchema.omit({
  projectRecords: true,
  subsubsections: true,
  acquisitionAreas: true,
  tags: true,
}).extend(m2mFormFields)
