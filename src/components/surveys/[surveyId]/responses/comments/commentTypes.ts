import type { ProjectUserDto } from "@/src/server/memberships/redactFormerProjectMemberUser.server"

/** Comment shape after server-side author redaction. */
export type RedactedCommentView = {
  id?: number
  body: string
  createdAt: Date
  updatedAt: Date
  isOwnComment?: boolean
  isFormerMemberComment?: boolean
  author?: ProjectUserDto | null
  userId?: number | null
}
