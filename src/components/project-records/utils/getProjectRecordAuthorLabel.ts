import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import { ProjectRecordType } from "@/src/prisma/generated/browser"
import type { ProjectRecord } from "@/src/server/projectRecords/types"

export const getProjectRecordAuthorLabel = ({
  type,
  author,
}: {
  type: ProjectRecordType
  author?: ProjectRecord["author"] | null
}) => {
  if (type === ProjectRecordType.SYSTEM) return "KI"

  return getFullnameWithInstitution(author ?? null) || "Nutzer*in"
}
