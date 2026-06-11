import { SparklesIcon } from "@heroicons/react/16/solid"
import { twJoin } from "tailwind-merge"
import { getFullname } from "@/src/components/core/users/getFullname"
import { pillShellClasses } from "@/src/components/core/utils/pillClassNames"
import { ProjectRecordType } from "@/src/prisma/generated/browser"
import type { ProjectRecord } from "@/src/server/projectRecords/types"

export const ProjectRecordTypePill = ({
  type,
  author,
}: {
  type: ProjectRecordType
  author?: ProjectRecord["author"]
}) => (
  <span
    className={twJoin(
      pillShellClasses,
      "border border-gray-200",
      "text-gray-500",
      type === ProjectRecordType.USER ? "bg-blue-100" : "bg-gray-100",
    )}
  >
    {type === ProjectRecordType.USER ? (
      author ? (
        <span>{getFullname(author) || "Nutzer*in"}</span>
      ) : (
        "Nutzer*in"
      )
    ) : (
      <span className="inline-flex items-center gap-1">
        <SparklesIcon className="size-3.5" />
        KI
      </span>
    )}
  </span>
)
