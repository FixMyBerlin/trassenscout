import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { deleteUploadFn } from "@/src/server/uploads/uploads.functions"
import { invalidateAfterUploadChange, markUploadDeletedInCache } from "./uploadQueryCache"

type Props = {
  projectSlug: string
  uploadId: number
  uploadTitle: string
  returnPath: string
  onDeleted?: () => void | Promise<void>
  variant?: "text" | "icon" | "linkWithIcon"
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
    void invalidateAfterUploadChange(queryClient, projectSlug)
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
