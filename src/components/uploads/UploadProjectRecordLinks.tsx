import {
  ProjectRecordRelationLink,
  projectRecordRelationKey,
  type ProjectRecordRelation,
} from "@/src/components/project-records/ProjectRelationLinks"

type Props = {
  projectSlug: string
  projectRecords: ProjectRecordRelation[]
  className?: string
}

export const UploadProjectRecordLinks = ({ projectRecords, className }: Props) => {
  if (projectRecords.length === 0) return null

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700">
        {projectRecords.length === 1 ? "Protokolleintrag:" : "Protokolleinträge:"}
      </label>
      <div className="mt-1 space-y-1 text-sm">
        {projectRecords.map((projectRecord) => (
          <ProjectRecordRelationLink
            key={projectRecordRelationKey(projectRecord)}
            projectRecord={projectRecord}
            withDate
            className="block w-fit"
          />
        ))}
      </div>
    </div>
  )
}
