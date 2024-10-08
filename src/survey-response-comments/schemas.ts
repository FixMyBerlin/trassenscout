import { z } from "zod"

// const Author = z.object({
//   id: z.number(),
//   osmName: z.string(),
//   // osmAvatar: z.string().nullable(), // Not used ATM
//   firstName: z.string().nullable(),
//   lastName: z.string().nullable(),
//   role: z.enum(["ADMIN", "USER"]),
// })

// export const SurveyResponseAndCommentsSchema = z.object({
//   // todo
//   id: z.number(),
//   createdAt: z.coerce.date(),
//   updatedAt: z.coerce.date(),
//   userId: z.number(),
//   author: Author,
//   subject: z.string(),
//   body: z.string().nullable(),
//   resolvedAt: z.union([z.null(), z.coerce.date()]),
//   latitude: z.number(),
//   longitude: z.number(),
//   noteComments: z
//     .array(
//       z.object({
//         id: z.number(),
//         noteId: z.number(),
//         createdAt: z.coerce.date(),
//         updatedAt: z.coerce.date(),
//         author: Author,
//         body: z.string(),
//       }),
//     )
//     .optional(),
// })

export const CreateSurveyResponseCommentSchema = z.object({
  surveyResponseId: z.number(),
  body: z.string(),
  projectSlug: z.string(),
})
