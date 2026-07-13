import { z } from "zod"
import { SupportDocumentFormSchema } from "@/src/shared/supportDocuments/schemas"

export const GetSupportDocumentsSchema = z.object({})

export const GetSupportDocumentSchema = z.object({ id: z.number() })

export const CreateSupportDocumentSchema = SupportDocumentFormSchema

export const UpdateSupportDocumentSchema = GetSupportDocumentSchema.extend(
  SupportDocumentFormSchema.shape,
)

export const DeleteSupportDocumentSchema = GetSupportDocumentSchema
