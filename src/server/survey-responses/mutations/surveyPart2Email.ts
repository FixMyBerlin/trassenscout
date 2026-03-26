import db from "@/db"
import { surveyEntryCreatedNotificationToUser } from "@/emails/mailers/surveyEntryCreatedNotificationToUser"
import { getFlatSurveyFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_utils/getFlatSurveyFormFields"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

export const SurveyPart2EmailSchema = z.object({
  surveySessionId: z.number(),
  data: z.record(z.any()),
  surveySlug: z.string() as z.ZodType<AllowedSurveySlugs>,
  searchParams: z.record(z.string()).nullable(),
})

const buildFieldValues = ({
  data,
  fields,
  part2Fields,
  searchParams,
  surveySlug,
}: {
  data: Record<string, any>
  fields: string[]
  part2Fields: ReturnType<typeof getFlatSurveyFormFields>
  searchParams: Record<string, string> | null
  surveySlug: AllowedSurveySlugs
}) => {
  const fieldValues: Record<string, string> = {}

  fields.forEach((fieldName) => {
    const field = part2Fields.find((f) => String(f.name) === fieldName)
    const value = data[fieldName] || ""

    if (fieldName === "surveyUrl" && searchParams) {
      const queryParams = Object.entries(searchParams)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&")
      fieldValues[fieldName] = `https://trassenscout.de/beteiligung/${surveySlug}/?${queryParams}`
      return
    }

    if (field?.component === "SurveyRadiobuttonGroup") {
      const props = field.props as any
      if (props.options) {
        const option = props.options.find((opt: any) => opt.key === value)
        fieldValues[fieldName] = option?.label || value
      } else {
        fieldValues[fieldName] = value
      }
      return
    }

    if (field?.component === "SurveyCheckboxGroup") {
      const props = field.props as any
      const selectedValues = Array.isArray(value)
        ? value.map((v) => String(v))
        : value != null && value !== ""
          ? [String(value)]
          : []

      if (props.options) {
        const labels = selectedValues.map((selectedValue: string) => {
          const normalizedValue = selectedValue.trim()
          const option = props.options.find((opt: any) => opt.key === normalizedValue)
          return option?.label || normalizedValue
        })
        fieldValues[fieldName] = labels.join(", ")
      } else {
        fieldValues[fieldName] = selectedValues.join(", ")
      }
      return
    }

    fieldValues[fieldName] = value
  })

  return fieldValues
}

export default resolver.pipe(
  resolver.zod(SurveyPart2EmailSchema),
  async ({ surveySessionId, data, surveySlug, searchParams }) => {
    // Get email configuration from survey config
    const emailConfig = getConfigBySurveySlug(surveySlug, "email")
    const adminEmailConfig = getConfigBySurveySlug(surveySlug, "adminEmail")

    if (!emailConfig) {
      return { success: false, message: "No email configuration found for this survey" }
    }

    // Get first survey part for personal data and email address
    const surveyPart1 = await db.surveyResponse.findFirst({
      where: { surveySessionId: surveySessionId, surveyPart: 1 },
    })
    const parsedSurveyPart1 = surveyPart1
      ? (JSON.parse(surveyPart1.data) as Record<string, any>)
      : {}

    // Extract email from survey data - check both surveyPart1 and part2 data
    const userEmail = (parsedSurveyPart1["email"] || data["email"]) as string

    if (!userEmail) {
      return { success: false, message: "User email not found in survey data" }
    }

    // Get part2 configuration to extract field labels
    const part2Config = getConfigBySurveySlug(surveySlug, "part2")
    const part2Fields = getFlatSurveyFormFields(part2Config)

    const fieldValues = buildFieldValues({
      data,
      fields: emailConfig.fields,
      part2Fields,
      searchParams,
      surveySlug,
    })

    // Create dynamic email mailer
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
  },
)
