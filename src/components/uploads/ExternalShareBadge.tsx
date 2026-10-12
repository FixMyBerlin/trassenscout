import { twJoin } from "tailwind-merge"
import { canExternallyShareUpload } from "@/src/shared/uploads/externalShare"
import type { UploadWithRelations } from "./uploadTypes"

type Props = {
  upload: Pick<UploadWithRelations, "externalShareEnabled" | "collaborationUrl" | "project">
  className?: string
}

export const ExternalShareBadge = ({ upload, className }: Props) => {
  if (!upload.externalShareEnabled || !upload.project?.externalShareEnabled) return null
  if (!canExternallyShareUpload(upload)) return null

  return (
    <span className={twJoin("text-xs font-medium text-orange-600", className)}>
      Extern freigegeben
    </span>
  )
}
