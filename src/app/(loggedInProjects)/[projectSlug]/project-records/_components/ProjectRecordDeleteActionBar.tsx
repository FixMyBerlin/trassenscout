"use client"

import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import deleteProjectRecord from "@/src/server/projectRecords/mutations/deleteProjectRecord"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"

type Props = {
  projectSlug: string
  projectRecordId: number
  projectRecordTitle: string
  returnPath: Route
}

export const ProjectRecordDeleteActionBar = ({
  projectSlug,
  projectRecordId,
  projectRecordTitle,
  returnPath,
}: Props) => {
  const [deleteProjectRecordMutation] = useMutation(deleteProjectRecord)

  return (
    <DeleteActionBar
      itemTitle={projectRecordTitle}
      onDelete={() => deleteProjectRecordMutation({ id: projectRecordId, projectSlug })}
      returnPath={returnPath}
    />
  )
}
