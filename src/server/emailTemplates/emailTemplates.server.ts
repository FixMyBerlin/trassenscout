import { z } from "zod"
import {
  getOriginFromHeaders,
  getPrdOrStgDomain,
} from "@/src/components/core/components/links/getDomain"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import {
  emailTemplateDefinitions,
  getEmailTemplateDefinition,
} from "@/src/shared/emailTemplates/registry"
import {
  EmailTemplateByKeySchema,
  UpsertEmailTemplateSchema,
} from "@/src/shared/emailTemplates/schemas"
import { buildEmailTemplatePreview, resolveEmailTemplate } from "./render"

export const DeleteEmailTemplateSchema = EmailTemplateByKeySchema

export async function getEmailTemplates(headers: Headers) {
  await endpointAuth.admin(headers)

  const dbTemplates = await db.emailTemplate.findMany({
    select: { key: true, updatedAt: true, updatedById: true },
    orderBy: { key: "asc" },
  })
  const dbTemplateMap = new Map(dbTemplates.map((template) => [template.key, template]))

  return emailTemplateDefinitions.map((definition) => {
    const dbTemplate = dbTemplateMap.get(definition.key)
    return {
      key: definition.key,
      name: definition.name,
      description: definition.description,
      supportsCta: definition.supportsCta,
      allowedVariables: definition.allowedVariables,
      sampleContext: definition.sampleContext,
      source: dbTemplate ? ("db" as const) : ("defaults" as const),
      updatedAt: dbTemplate?.updatedAt ?? null,
      updatedById: dbTemplate?.updatedById ?? null,
    }
  })
}

export async function getEmailTemplate(
  headers: Headers,
  input: z.infer<typeof EmailTemplateByKeySchema>,
) {
  await endpointAuth.admin(headers)
  const resolved = await resolveEmailTemplate(input.key)

  return {
    key: resolved.key,
    name: resolved.definition.name,
    description: resolved.definition.description,
    supportsCta: resolved.definition.supportsCta,
    allowedVariables: resolved.definition.allowedVariables,
    sampleContext: resolved.definition.sampleContext,
    source: resolved.source,
    subject: resolved.subject,
    introMarkdown: resolved.introMarkdown,
    outroMarkdown: resolved.outroMarkdown ?? "",
    ctaText: resolved.definition.supportsCta ? (resolved.ctaText ?? "") : "",
  }
}

export async function previewEmailTemplate(
  headers: Headers,
  input: z.infer<typeof UpsertEmailTemplateSchema>,
) {
  await endpointAuth.admin(headers)
  const definition = getEmailTemplateDefinition(input.key)
  const normalizedCtaText = definition.supportsCta ? input.ctaText : undefined

  const assetBaseUrl = getOriginFromHeaders(headers) ?? getPrdOrStgDomain()

  return buildEmailTemplatePreview(
    input.key,
    {
      subject: input.subject,
      introMarkdown: input.introMarkdown,
      outroMarkdown: input.outroMarkdown,
      ctaText: normalizedCtaText,
    },
    definition.sampleContext,
    { assetBaseUrl },
  )
}

export async function upsertEmailTemplate(
  headers: Headers,
  input: z.infer<typeof UpsertEmailTemplateSchema>,
) {
  const session = await endpointAuth.admin(headers)
  const { key, ...data } = input

  return db.emailTemplate.upsert({
    where: { key },
    create: {
      key,
      ...data,
      updatedById: Number(session.userId),
    },
    update: {
      ...data,
      updatedById: Number(session.userId),
    },
  })
}

export async function deleteEmailTemplate(
  headers: Headers,
  input: z.infer<typeof DeleteEmailTemplateSchema>,
) {
  await endpointAuth.admin(headers)

  return db.emailTemplate.delete({
    where: { key: input.key },
  })
}
