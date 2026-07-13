import { z } from "zod"

export const CreateSurveyResponseCommentSchema = z.object({
  surveyResponseId: z.number(),
  body: z.string(),
})

export const CommentBodyFormSchema = z.object({
  body: z.string().min(1, { error: "Pflichtfeld." }),
})

export const commentBodyFormDefaultValues: z.infer<typeof CommentBodyFormSchema> = {
  body: "",
}
