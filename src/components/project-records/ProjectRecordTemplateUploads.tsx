import { useQuery } from "@tanstack/react-query"
import { Link } from "@/src/components/core/components/links/Link"
import { uploadDownloadUrl } from "@/src/components/uploads/utils/uploadUrl"
import { projectRecordTemplatesByProjectQueryOptions } from "@/src/server/projectRecordTemplates/projectRecordTemplatesQueryOptions"

/** Temporary (see FORM_TEMPLATES_HIDDEN): the Protokollvorlage's documents in this project. */
export const useProjectRecordTemplateUploads = (
  projectSlug: string,
  projectRecordTemplateId: number | null | undefined,
) => {
  const { data: templates = [] } = useQuery({
    ...projectRecordTemplatesByProjectQueryOptions({ projectSlug }),
    enabled: Boolean(projectRecordTemplateId),
  })
  return templates.find((template) => template.id === projectRecordTemplateId)?.uploads ?? []
}

type Props = {
  projectSlug: string
  uploads: ReturnType<typeof useProjectRecordTemplateUploads>
}

export const ProjectRecordTemplateUploadsList = ({ projectSlug, uploads }: Props) => (
  <ul className="flex flex-col gap-1">
    {uploads.map((upload) => (
      <li key={upload.id}>
        <Link href={uploadDownloadUrl(upload, projectSlug)}>{upload.title}</Link>
      </li>
    ))}
  </ul>
)
