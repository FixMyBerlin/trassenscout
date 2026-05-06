import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { projectRecordAssignedNotificationToUser } from "@/emails/mailers/projectRecordAssignedNotificationToUser"
import { shortTitle } from "@/src/core/components/text"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import { validateAcquisitionAreaScope } from "@/src/server/acquisitionAreas/_utils/validateAcquisitionAreaScope"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { m2mFields, M2MFieldsType } from "@/src/server/projectRecords/m2mFields"
import { ProjectRecordSchema } from "@/src/server/projectRecords/schemas"
import getProjectIdBySlug from "@/src/server/projects/queries/getProjectIdBySlug"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { ProjectRecordReviewState, ProjectRecordType } from "@prisma/client"
import db from "db"

const CreateProjectRecordSchema = ProjectSlugRequiredSchema.merge(ProjectRecordSchema).omit({
  projectId: true,
  projectRecordAuthorType: true,
  projectRecordUpdatedByType: true,
  reviewState: true,
})

export default resolver.pipe(
  resolver.zod(CreateProjectRecordSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...data }, ctx: Ctx) => {
    // copied from updateSubsubsection.ts
    // const disconnect: Record<M2MFieldsType | string, { set: [] }> = {}
    const connect: Record<M2MFieldsType | string, { connect: { id: number }[] | undefined }> = {}
    m2mFields.forEach((fieldName) => {
      connect[fieldName] = { connect: data[fieldName] ? data[fieldName].map((id) => ({ id })) : [] }
      delete data[fieldName]
    })
    const projectId = await getProjectIdBySlug(projectSlug)
    const currentUserId = ctx.session.userId

    await validateAcquisitionAreaScope({
      projectSlug,
      acquisitionAreaId: data.acquisitionAreaId,
      subsectionId: data.subsectionId,
      subsubsectionId: data.subsubsectionId,
    })

    const record = await db.projectRecord.create({
      // @ts-expect-error The whole `m2mFields` is way to hard to type but apparently working
      data: {
        projectId,
        ...data,
        ...connect,
        // Set both author and updatedBy to current user on creation
        // we only have USER type for now
        userId: currentUserId,
        projectRecordAuthorType: ProjectRecordType.USER,
        updatedById: currentUserId,
        projectRecordUpdatedByType: ProjectRecordType.USER,
        // New projectRecords are immediately marked as APPROVED when created by users
        reviewState: ProjectRecordReviewState.APPROVED,
        reviewedById: null,
        reviewedAt: null,
      },
    })

    const isNewAssignment = record.assignedToId !== null
    const isSelfAssignment = record.assignedToId === currentUserId

    if (isNewAssignment && !isSelfAssignment) {
      const [assignee, actor] = await Promise.all([
        db.user.findUnique({
          where: { id: record.assignedToId! },
          select: { email: true, firstName: true, lastName: true },
        }),
        db.user.findUnique({
          where: { id: currentUserId! },
          select: { firstName: true, lastName: true },
        }),
      ])

      if (assignee && actor) {
        const assigneeName =
          [assignee.firstName, assignee.lastName].filter(Boolean).join(" ") || assignee.email
        const actorName = [actor.firstName, actor.lastName].filter(Boolean).join(" ") || "Unbekannt"
        const recordTitle = record.title
        const recordPath = projectRecordDetailRoute(projectSlug, record.id)

        await (
          await projectRecordAssignedNotificationToUser({
            assigneeEmail: assignee.email,
            assigneeName,
            actorName,
            recordTitle,
            projectName: shortTitle(projectSlug),
            recordPath,
          })
        ).send()
      }
    }

    await createLogEntry({
      action: "CREATE",
      message: `Neuer Protokolleintrag ${record ? record.title : ""}`,
      userId: ctx.session.userId,
      projectId,
      projectRecordId: record.id,
    })

    return record
  },
)
