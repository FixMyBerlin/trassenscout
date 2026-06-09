import { z } from "zod"

export const CommentBodyFormSchema = z.object({
  body: z.string(),
})

/** Empty form state for AppField typing + `form.reset()`. */
export const commentFormDefaultValues: z.infer<typeof CommentBodyFormSchema> = {
  body: "",
}

export const CreateSurveyResponseCommentSchema = z.object({
  surveyResponseId: z.number(),
  body: z.string(),
})
