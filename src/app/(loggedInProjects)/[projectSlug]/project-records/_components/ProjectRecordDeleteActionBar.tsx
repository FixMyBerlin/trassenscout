"use client"

import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { projectRecordDeleteRoute } from "@/src/core/routes/projectRecordRoutes"
import deleteProjectRecord from "@/src/server/projectRecords/mutations/deleteProjectRecord"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"

type Props = {
  projectSlug: string
  projectRecordId: number
  projectRecordTitle: string
  returnPath: Route
  uploadsCount: number
}

export const ProjectRecordDeleteActionBar = ({
  projectSlug,
  projectRecordId,
  projectRecordTitle,
  returnPath,
  uploadsCount,
}: Props) => {
  const router = useRouter()
  const [deleteProjectRecordMutation] = useMutation(deleteProjectRecord)

  const handleDelete = async () => {
    await deleteProjectRecordMutation({ id: projectRecordId, projectSlug })
  }

  const handleCustomClick = () => {
    router.push(projectRecordDeleteRoute(projectSlug, projectRecordId))
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
