import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { pillShellClasses } from "@/src/core/utils/pillClassNames"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { SparklesIcon } from "@heroicons/react/16/solid"
import { ProjectRecordType } from "@prisma/client"
import clsx from "clsx"

export const ProjectRecordTypePill = ({
  type,
  author,
}: {
  type: ProjectRecordType
  author?: Awaited<ReturnType<typeof getProjectRecord>>["author"]
}) => (
  <span
    className={clsx(
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
