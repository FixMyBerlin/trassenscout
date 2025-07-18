import db from "@/db"
import { surveyEntryCreatedNotificationToUser } from "@/emails/mailers/surveyEntryCreatedNotificationToUser"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getFlatSurveyFormFields } from "@/src/survey-responses/utils/getFlatSurveyFormFields"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

export const SurveyFeedbackMail = z.object({
  surveySessionId: z.number(),
  data: z.record(z.any()),
  surveySlug: z.string() as z.ZodType<AllowedSurveySlugs>,
  searchParams: z.record(z.string()).nullable(),
})

export default resolver.pipe(
  resolver.zod(SurveyFeedbackMail),
  async ({ surveySessionId, data, surveySlug, searchParams }) => {
    // Get email configuration from survey config
    const emailConfig = getConfigBySurveySlug(surveySlug, "email")

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

    // Build field values based on email configuration
    const fieldValues: Record<string, string> = {}

    emailConfig.fields.forEach((fieldName) => {
      const field = part2Fields.find((f) => String(f.name) === fieldName)
      // todo fields might be in parsedSurveyPart1 or parsedSurveyPart3
      const value = data[fieldName] || ""

      if (fieldName === "surveyUrl" && searchParams) {
        const queryParams = Object.entries(searchParams)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join("&")
        fieldValues[fieldName] = `https://trassenscout.de/beteiligung/${surveySlug}/?${queryParams}`
      } else {
        // Handle different field types
        if (
          field?.component === "SurveyRadiobuttonGroup" ||
          field?.component === "SurveyCheckboxGroup"
        ) {
          // For radio/checkbox groups, get the label from options
          const props = field.props as any
          if (props.options) {
            const option = props.options.find((opt: any) => opt.key === value)
            fieldValues[fieldName] = option?.label || value
          } else {
            fieldValues[fieldName] = value
          }
        } else {
          fieldValues[fieldName] = value
        }
      }
    })

    // Create dynamic email mailer
    const message = await surveyEntryCreatedNotificationToUser({
      userEmail,
      subject: emailConfig.subject,
      markdown: emailConfig.markdown,
      fieldValues,
    })

    await message.send()

    return { success: true, message: "Email sent successfully" }
  },
)
