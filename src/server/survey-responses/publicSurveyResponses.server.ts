import { z } from "zod"
import { surveyEntryCreatedNotificationToUser } from "@/emails/mailers/surveyEntryCreatedNotificationToUser"
import {
  allowedSurveySlugs,
  type AllowedSurveySlugs,
} from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getFlatSurveyFormFields } from "@/src/components/surveys/responses/getFlatSurveyFormFields"
import { SurveyResponseStateEnum } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { enforcePublicEndpointRateLimit } from "@/src/server/auth/publicEndpointRateLimit.server"
import db from "@/src/server/db.server"
import { GetOrCreateCreatedSurveyResponsePublicSchema } from "./publicSurveyResponses.inputSchemas"
import { createNextOhvReferenceId } from "./utils/ohvReferenceId"

export { GetOrCreateCreatedSurveyResponsePublicSchema }

const publicSurveyEmailFailure = {
  success: false as const,
  message: "Unable to send email for this survey session",
}

export const UpdateSurveyResponsePublicSchema = z.object({
  id: z.number(),
  surveySessionId: z.number(),
  data: z.string(),
  state: z.enum(SurveyResponseStateEnum),
})

export const SurveyPart2EmailSchema = z.object({
  surveySessionId: z.number(),
  data: z.record(z.string(), z.unknown()),
  surveySlug: z.enum(allowedSurveySlugs),
  searchParams: z.record(z.string(), z.string()).nullable(),
})

export async function getOrCreateCreatedSurveyResponsePublic(
  headers: Headers,
  input: z.infer<typeof GetOrCreateCreatedSurveyResponsePublicSchema>,
) {
  endpointAuth.public("public survey response draft with rate limiting")
  enforcePublicEndpointRateLimit(headers, "getOrCreateCreatedSurveyResponsePublic")
  const existing = await db.surveyResponse.findFirst({
    where: {
      surveySessionId: input.surveySessionId,
      surveyPart: input.surveyPart,
      state: SurveyResponseStateEnum.CREATED,
    },
    select: { id: true, data: true },
  })

  if (existing) return existing

  return db.surveyResponse.create({
    data: {
      surveySessionId: input.surveySessionId,
      surveyPart: input.surveyPart,
      data: input.data,
      source: input.source,
      status: input.status,
      state: SurveyResponseStateEnum.CREATED,
    },
    select: { id: true, data: true },
  })
}

export async function updateSurveyResponsePublic(
  headers: Headers,
  input: z.infer<typeof UpdateSurveyResponsePublicSchema>,
) {
  endpointAuth.public("public survey response update with rate limiting")
  enforcePublicEndpointRateLimit(headers, "updateSurveyResponsePublic")
  const { id, surveySessionId, data, state } = input

  return db.$transaction(async (tx) => {
    const existingResponse = await tx.surveyResponse.findFirst({
      where: { id, surveySessionId },
    })

    if (!existingResponse) {
      throw new Error(
        `SurveyResponse with id ${id} does not belong to surveySessionId ${surveySessionId}`,
      )
    }

    let nextData = data

    if (state === SurveyResponseStateEnum.SUBMITTED) {
      const surveySession = await tx.surveySession.findFirstOrThrow({
        where: { id: surveySessionId },
        select: {
          surveyId: true,
          survey: { select: { slug: true } },
        },
      })

      const isOhvPart2 =
        surveySession.survey.slug === "ohv-haltestellenfoerderung" &&
        existingResponse.surveyPart === 2

      if (isOhvPart2) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${surveySession.surveyId})`

        const parsedData = JSON.parse(data) as Record<string, unknown>

        if (typeof parsedData.referenceId !== "string" || parsedData.referenceId.length === 0) {
          const referenceId = await createNextOhvReferenceId(surveySession.surveyId, tx)
          nextData = JSON.stringify({ ...parsedData, referenceId })
        }
      }
    }

    return tx.surveyResponse.update({
      where: { state: SurveyResponseStateEnum.CREATED, id, surveySessionId },
      data: { data: nextData, state },
    })
  })
}

function buildFieldValues({
  data,
  fields,
  part2Fields,
  searchParams,
  surveySlug,
}: {
  data: Record<string, unknown>
  fields: string[]
  part2Fields: ReturnType<typeof getFlatSurveyFormFields>
  searchParams: Record<string, string> | null
  surveySlug: AllowedSurveySlugs
}) {
  const fieldValues: Record<string, string> = {}

  for (const fieldName of fields) {
    const field = part2Fields.find((f) => String(f.name) === fieldName)
    const value = data[fieldName] ?? ""

    if (fieldName === "surveyUrl" && searchParams) {
      const queryParams = Object.entries(searchParams)
        .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
        .join("&")
      fieldValues[fieldName] = `https://trassenscout.de/beteiligung/${surveySlug}/?${queryParams}`
      continue
    }

    if (field?.component === "SurveyRadiobuttonGroup") {
      const props = field.props as { options?: { key: string; label: string }[] }
      if (props.options) {
        const option = props.options.find((opt) => opt.key === value)
        fieldValues[fieldName] = option?.label || String(value)
      } else {
        fieldValues[fieldName] = String(value)
      }
      continue
    }

    if (field?.component === "SurveyCheckboxGroup") {
      const props = field.props as { options?: { key: string; label: string }[] }
      const selectedValues = Array.isArray(value)
        ? value.map((v) => String(v))
        : value != null && value !== ""
          ? [String(value)]
          : []

      if (props.options) {
        const labels = selectedValues.map((selectedValue) => {
          const normalizedValue = selectedValue.trim()
          const option = props.options!.find((opt) => opt.key === normalizedValue)
          return option?.label || normalizedValue
        })
        fieldValues[fieldName] = labels.join(", ")
      } else {
        fieldValues[fieldName] = selectedValues.join(", ")
      }
      continue
    }

    fieldValues[fieldName] = String(value)
  }

  return fieldValues
}

export async function sendSurveyPart2Email(
  headers: Headers,
  input: z.infer<typeof SurveyPart2EmailSchema>,
) {
  endpointAuth.public("public survey part 2 email with rate limiting")
  enforcePublicEndpointRateLimit(headers, "sendSurveyPart2Email", { max: 10 })

  const { surveySessionId, data, surveySlug, searchParams } = input
  const emailConfig = getConfigBySurveySlug(surveySlug, "email")
  const adminEmailConfig = getConfigBySurveySlug(surveySlug, "adminEmail")

  if (!emailConfig) {
    return publicSurveyEmailFailure
  }

  const surveySession = await db.surveySession.findFirst({
    where: { id: surveySessionId, survey: { slug: surveySlug } },
    select: { id: true },
  })
  if (!surveySession) {
    return publicSurveyEmailFailure
  }

  const surveyPart1 = await db.surveyResponse.findFirst({
    where: { surveySessionId, surveyPart: 1 },
    select: { data: true },
  })
  if (!surveyPart1) {
    return publicSurveyEmailFailure
  }

  const parsedSurveyPart1 = JSON.parse(surveyPart1.data) as Record<string, unknown>
  const userEmail =
    typeof parsedSurveyPart1.email === "string" ? parsedSurveyPart1.email.trim() : ""
  if (!userEmail) {
    return publicSurveyEmailFailure
  }

  const part2Config = getConfigBySurveySlug(surveySlug, "part2")
  const part2Fields = getFlatSurveyFormFields(part2Config)

  const fieldValues = buildFieldValues({
    data,
    fields: emailConfig.fields,
    part2Fields,
    searchParams,
    surveySlug,
  })

  const message = await surveyEntryCreatedNotificationToUser({
    userEmail,
    subject: emailConfig.subject,
    markdown: emailConfig.markdown,
    fieldValues,
  })
  await message.send()

  if (adminEmailConfig && adminEmailConfig.recipients.length > 0) {
    const adminFieldValues = buildFieldValues({
      data,
      fields: adminEmailConfig.fields,
      part2Fields,
      searchParams,
      surveySlug,
    })

    const recipients = Array.from(new Set(adminEmailConfig.recipients.filter(Boolean)))

    await Promise.all(
      recipients.map(async (recipient) => {
        const adminMessage = await surveyEntryCreatedNotificationToUser({
          userEmail: recipient,
          subject: adminEmailConfig.subject,
          markdown: adminEmailConfig.markdown,
          fieldValues: adminFieldValues,
        })
        await adminMessage.send()
      }),
    )
  }

  return { success: true, message: "Email sent successfully" }
}
