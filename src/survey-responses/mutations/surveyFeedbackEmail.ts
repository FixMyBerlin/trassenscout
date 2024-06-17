import { resolver } from "@blitzjs/rpc"
import db from "db"
import { surveyFeedbackMailer } from "mailers/surveyFeedbackMailer"
import { z } from "zod"
import { feedbackDefinition } from "src/survey-public/radnetz-brandenburg/data/feedback"

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

    const categories = Object.fromEntries(
      // @ts-expect-error
      feedbackDefinition.pages[0]?.questions
        // todo survey clean up or refactor after survey BB
        // the category ref is hard coded
        .find((q) => q.id == 22)
        // @ts-expect-error
        .props.responses.map((response) => [response.id, response.text.de]),
    )

    if (surveyPart1) {
      const parsedSurveyPart1 = JSON.parse(surveyPart1?.data)
      // Send the email
      // todo survey clean up or refactor after survey BB
      // the refs are hard coded to reduce the complexity of the code as we do not know if we keep this feature
      await surveyFeedbackMailer({
        // @ts-expect-error
        userMail: parsedSurveyPart1["3"],
        // @ts-expect-error
        userFirstname: parsedSurveyPart1["1"],
        // @ts-expect-error
        userLastname: parsedSurveyPart1["2"],
        feedbackLocation: data["24"],
        feedbackCategory: categories[data["22"]],
        feedbackText: data["25"],
        lineID: data["20"],
      }).send()
    }
    return
  },
)
