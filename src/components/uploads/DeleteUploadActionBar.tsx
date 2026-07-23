import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { deleteUploadFn } from "@/src/server/uploads/uploads.functions"
import { invalidateUploadLists, markUploadDeletedInCache } from "./uploadQueryCache"

type Props = {
  projectSlug: string
  uploadId: number
  uploadTitle: string
  returnPath: string
  onDeleted?: () => void | Promise<void>
  variant?: "text" | "icon"
}

export const DeleteUploadActionBar = ({
  projectSlug,
  uploadId,
  uploadTitle,
  returnPath,
  onDeleted,
  variant = "icon",
}: Props) => {
  const queryClient = useQueryClient()
  const deleteUploadMutation = useMutation({
    mutationFn: deleteUploadFn,
  })

  const handleDelete = async () => {
    await markUploadDeletedInCache(queryClient, projectSlug, uploadId)
    await deleteUploadMutation.mutateAsync({ data: { projectSlug, id: uploadId } })
    invalidateUploadLists(queryClient, projectSlug)
    void queryClient.invalidateQueries({ queryKey: ["projectRecords"] })
  }

  return (
    <DeleteActionBar
      itemTitle={uploadTitle}
      onDelete={handleDelete}
      onDeleted={onDeleted}
      returnPath={returnPath}
      variant={variant}
    />
  )
}
