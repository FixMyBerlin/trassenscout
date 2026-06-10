import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { deleteProjectRecordFn } from "@/src/server/projectRecords/projectRecords.functions"

type Props = {
  projectSlug: string
  projectRecordId: number
  projectRecordTitle: string
  returnPath: string
  uploadsCount: number
}

export const ProjectRecordDeleteActionBar = ({
  projectSlug,
  projectRecordId,
  projectRecordTitle,
  returnPath,
  uploadsCount,
}: Props) => {
  const navigate = useNavigate()
  const deleteProjectRecordMutation = useMutation({ mutationFn: deleteProjectRecordFn })

  const handleDelete = async () => {
    await deleteProjectRecordMutation.mutateAsync({
      data: { id: projectRecordId, projectSlug },
    })
  }

  const handleCustomClick = () => {
    navigate({
      to: "/$projectSlug/project-records/$projectRecordId/delete",
      params: { projectSlug, projectRecordId: String(projectRecordId) },
    })
  }

  return (
    <DeleteActionBar
      itemTitle={projectRecordTitle}
      onDelete={uploadsCount > 0 ? undefined : handleDelete}
      onClick={uploadsCount > 0 ? handleCustomClick : undefined}
      returnPath={returnPath}
    />
  )
}
