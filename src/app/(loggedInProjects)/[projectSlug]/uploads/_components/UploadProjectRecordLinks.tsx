"use client"

import { Link } from "@/src/core/components/links"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import { formatBerlinTime } from "@/src/core/utils/formatBerlinTime"

type ProjectRecordLink = {
  id: number
  title: string
  date: Date | null
}

type Props = {
  projectSlug: string
  projectRecords: ProjectRecordLink[]
  className?: string
}

export const UploadProjectRecordLinks = ({ projectSlug, projectRecords, className }: Props) => {
  if (projectRecords.length === 0) return null

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700">
        Verknüpfung mit Protokolleintrag
      </label>
      <div className="mt-1 space-y-1 text-sm">
        {projectRecords.map((projectRecord) => (
          <Link
            key={projectRecord.id}
            href={projectRecordDetailRoute(projectSlug, projectRecord.id)}
            scroll={false}
            className="block w-fit"
          >
            {projectRecord.title}
            {projectRecord.date ? ` (${formatBerlinTime(projectRecord.date, "dd.MM.yyyy")})` : ""}
          </Link>
        ))}
      </div>
    </div>
  )
}
