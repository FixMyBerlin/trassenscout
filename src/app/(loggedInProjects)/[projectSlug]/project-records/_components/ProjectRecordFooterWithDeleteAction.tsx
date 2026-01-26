"use client"

import { DeleteAndBackLinkFooter } from "@/src/core/components/forms/DeleteAndBackLinkFooter"
import deleteProjectRecord from "@/src/server/projectRecords/mutations/deleteProjectRecord"
import { useMutation } from "@blitzjs/rpc"

type Props = {
  projectSlug: string
  projectRecordId: number
  backHref: string
  backText: string
  fieldName?: string
}

export const ProjectRecordFooterWithDeleteAction = ({
  projectSlug,
  projectRecordId,
  backHref,
  backText,
  fieldName = "Protokolleintrag",
}: Props) => {
  const [deleteProjectRecordMutation] = useMutation(deleteProjectRecord)

  return (
    <DeleteAndBackLinkFooter
      id={projectRecordId}
      fieldName={fieldName}
      deleteAction={{
        mutate: () => deleteProjectRecordMutation({ id: projectRecordId, projectSlug }),
      }}
      backHref={backHref}
      backText={backText}
    />
  )
}
