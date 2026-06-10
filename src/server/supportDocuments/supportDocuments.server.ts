import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { deleteUploadFileAndDbRecord } from "@/src/server/uploads/_utils/deleteUploadFileAndDbRecord"
import { NotFoundError } from "@/src/shared/auth/errors"
import { SupportDocumentFormSchema } from "@/src/shared/supportDocuments/schemas"

export const GetSupportDocumentSchema = z.object({ id: z.number() })
export const CreateSupportDocumentSchema = SupportDocumentFormSchema
export const UpdateSupportDocumentSchema = GetSupportDocumentSchema.extend(
  SupportDocumentFormSchema.shape,
)
export const DeleteSupportDocumentSchema = GetSupportDocumentSchema

export async function getSupportDocuments(headers: Headers) {
  await endpointAuth.session(headers)

  return db.supportDocument.findMany({
    include: {
      upload: true,
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { order: "asc" },
  })
}

export async function getSupportDocument(
  headers: Headers,
  input: z.infer<typeof GetSupportDocumentSchema>,
) {
  await endpointAuth.admin(headers)

  return db.supportDocument.findUniqueOrThrow({
    include: { upload: true },
    where: { id: input.id },
  })
}

export async function createSupportDocument(
  headers: Headers,
  input: z.infer<typeof CreateSupportDocumentSchema>,
) {
  const session = await endpointAuth.admin(headers)
  const userId = Number(session.userId)
  const { externalUrl, mimeType, fileSize, order, ...documentFields } = input

  if (externalUrl) {
    return db.supportDocument.create({
      data: {
        ...documentFields,
        ...(order !== undefined && { order }),
        createdById: userId,
        upload: {
          create: {
            title: input.title,
            externalUrl,
            mimeType: mimeType ?? null,
            fileSize: fileSize ?? null,
            createdById: userId,
            projectId: null,
          },
        },
      },
      include: { upload: true },
    })
  }

  return db.supportDocument.create({
    data: {
      ...input,
      createdById: userId,
    },
    include: { upload: true },
  })
}

export async function updateSupportDocument(
  headers: Headers,
  input: z.infer<typeof UpdateSupportDocumentSchema>,
) {
  await endpointAuth.admin(headers)
  const { id, ...data } = input

  return db.supportDocument.update({
    where: { id },
    data,
    include: { upload: true },
  })
}

export async function deleteSupportDocument(
  headers: Headers,
  input: z.infer<typeof DeleteSupportDocumentSchema>,
) {
  await endpointAuth.admin(headers)

  const document = await db.supportDocument.findFirst({
    where: { id: input.id },
    include: {
      upload: {
        select: {
          id: true,
          externalUrl: true,
          collaborationUrl: true,
          collaborationPath: true,
        },
      },
    },
  })

  if (!document) {
    throw new NotFoundError("Support document not found")
  }

  if (document.upload) {
    await deleteUploadFileAndDbRecord(document.upload)
  }

  await db.supportDocument.deleteMany({ where: { id: input.id } })

  return { id: input.id }
}
