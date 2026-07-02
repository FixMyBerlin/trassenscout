import { Link } from "@/src/components/core/components/links/Link"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import { useProjectRecordModal } from "@/src/components/project-records/ProjectRecordModalHost"

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
  const projectRecordModal = useProjectRecordModal()

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
            to={
              projectRecordModal
                ? projectRecordModal.getProjectRecordDetailHref({
                    projectRecordId: projectRecord.id,
                  })
                : "/$projectSlug/project-records/$projectRecordId"
            }
            params={
              projectRecordModal
                ? undefined
                : {
                    projectSlug,
                    projectRecordId: String(projectRecord.id),
                  }
            }
            resetScroll={false}
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
