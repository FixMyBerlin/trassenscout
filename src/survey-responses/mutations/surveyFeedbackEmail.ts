import db from "@/db"
import { surveyEntryCreatedNotificationToUser } from "@/emails/mailers/surveyEntryCreatedNotificationToUser"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

// this component is hard coded for the survey radnetz-brandenburg part2
// it is used to send an email to the user with the feedback they provided
// if we want to use this for other surveys, we need to refactor the code

export const SurveyFeedbackMail = z.object({
  surveySessionId: z.number(),
  data: z.record(z.any()),
})

export default resolver.pipe(
  resolver.zod(SurveyFeedbackMail),
  async ({ surveySessionId, data }) => {
    // Get first survey part for personal data and email adress
    const surveyPart1 = await db.surveyResponse.findFirst({
      where: { surveySessionId: surveySessionId, surveyPart: 1 },
    })

    const feedbackDefinition = getConfigBySurveySlug("radnetz-brandenburg", "part2")

    const categories = Object.fromEntries(
      // @ts-expect-error
      feedbackDefinition.pages[0]?.fields
        // todo survey clean up or refactor after survey BB
        // the category ref is hard coded
        .find((q) => String(q.name) == "22")
        // @ts-expect-error
        .props.options.map((option) => [option.key, option.label]),
    )

    if (surveyPart1) {
      const parsedSurveyPart1 = JSON.parse(surveyPart1?.data)
      // Send the email
      // todo survey clean up or refactor after survey BB
      // the refs are hard coded to reduce the complexity of the code as we do not know if we keep this feature
      await (
        await surveyEntryCreatedNotificationToUser({
          // @ts-expect-error
          userMail: parsedSurveyPart1["3"],
          // @ts-expect-error
          userFirstname: parsedSurveyPart1["1"],
          // @ts-expect-error
          userLastname: parsedSurveyPart1["2"],
          feedbackLocation: data["24"],
          feedbackCategory: categories[data["22"]],
          feedbackText: data["25"],
          lineFromToName: data["30"],
        })
      ).send()
    }
    return
  },
)
