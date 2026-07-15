import { z } from "zod"
import {
  clearContactModalSearch,
  contactModalSearchSchema,
  contactModalViewSchema,
} from "@/src/shared/contacts/searchSchemas"
import {
  clearInviteModalSearch,
  inviteModalSearchSchema,
  inviteModalViewSchema,
} from "@/src/shared/invites/searchSchemas"
import {
  clearProjectRecordModalSearch,
  projectRecordModalSearchSchema,
  projectRecordModalViewSchema,
} from "@/src/shared/projectRecords/searchSchemas"
import {
  clearProjectUploadModalSearch,
  projectUploadModalSearchSchema,
  projectUploadModalViewSchema,
} from "@/src/shared/uploads/searchSchemas"

export function clearAllProjectModalSearch<TSearch extends Record<string, unknown>>(
  search: TSearch,
) {
  return clearInviteModalSearch(
    clearContactModalSearch(clearProjectRecordModalSearch(clearProjectUploadModalSearch(search))),
  )
}

export const loggedInProjectModalSearchSchema = z
  .object({
    modalUploadId: z.coerce.number().int().positive().optional(),
    modalUploadView: projectUploadModalViewSchema.optional(),
    modalProjectRecordId: z.coerce.number().int().positive().optional(),
    modalProjectRecordView: projectRecordModalViewSchema.optional(),
    modalContactId: z.coerce.number().int().positive().optional(),
    modalContactView: contactModalViewSchema.optional(),
    modalInviteView: inviteModalViewSchema.optional(),
  })
  .transform((search) => {
    const uploadSearch = projectUploadModalSearchSchema.parse(search)
    const projectRecordSearch = projectRecordModalSearchSchema.parse(search)
    const contactSearch = contactModalSearchSchema.parse(search)
    const inviteSearch = inviteModalSearchSchema.parse(search)
    const hasUploadModal =
      uploadSearch.modalUploadId !== undefined && uploadSearch.modalUploadView !== undefined
    const hasProjectRecordModal =
      projectRecordSearch.modalProjectRecordId !== undefined &&
      projectRecordSearch.modalProjectRecordView !== undefined
    const hasContactModal = contactSearch.modalContactView !== undefined
    const hasInviteModal = inviteSearch.modalInviteView !== undefined

    const activeModalCount = [
      hasUploadModal,
      hasProjectRecordModal,
      hasContactModal,
      hasInviteModal,
    ].filter(Boolean).length

    if (activeModalCount > 1) {
      return clearAllProjectModalSearch(search)
    }

    return {
      ...uploadSearch,
      ...projectRecordSearch,
      ...contactSearch,
      ...inviteSearch,
    }
  })

export type LoggedInProjectModalSearch = z.infer<typeof loggedInProjectModalSearchSchema>
