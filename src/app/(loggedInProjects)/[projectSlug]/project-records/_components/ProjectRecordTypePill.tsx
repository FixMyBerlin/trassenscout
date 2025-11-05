import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import getProjectRecord from "@/src/server/projectRecord/queries/getProjectRecord"
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
      "inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 font-medium text-gray-500",
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
        <SparklesIcon className="h-3.5 w-3.5" />
        System
      </span>
    )}
  </span>
)
