"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Link, whiteButtonStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import deleteUpload from "@/src/server/uploads/mutations/deleteUpload"
import getUploadWithSubsections from "@/src/server/uploads/queries/getUploadWithSubsections"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { useRouter } from "next/navigation"
import { UploadTable } from "./UploadTable"
import { splitReturnTo } from "./utils/splitReturnTo"

type Props = {
  upload: PromiseReturnType<typeof getUploadWithSubsections>
  projectSlug: string
  returnPath?: string
}

export const UploadDetail = ({ upload, projectSlug, returnPath }: Props) => {
  const router = useRouter()
  const { subsectionSlug, subsubsectionSlug } = splitReturnTo({ returnPath })
  let backUrl = `/${projectSlug}/uploads`
  if (subsectionSlug && subsubsectionSlug) {
    backUrl = `/${projectSlug}/abschnitte/${subsectionSlug}/fuehrung/${subsubsectionSlug}`
  }

  const [deleteUploadMutation] = useMutation(deleteUpload)
  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${upload.id} unwiderruflich löschen?`)) {
      try {
        await deleteUploadMutation({ projectSlug, id: upload.id })
        router.push(`/${projectSlug}/uploads`)
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  return (
    <>
      <IfUserCanEdit>
        <ButtonWrapper className="mb-10 space-x-4">
          <Link button="blue" href={`/${projectSlug}/uploads/${upload.id}/edit`}>
            Bearbeiten
          </Link>
          <button type="button" onClick={handleDelete} className={whiteButtonStyles}>
            Löschen
          </button>
          <Link href={`/${projectSlug}/uploads`}>Zurück zu Dokumenten</Link>
        </ButtonWrapper>
      </IfUserCanEdit>

      <UploadTable withAction={false} uploads={[upload]} />

      <SuperAdminLogData data={upload} />
    </>
  )
}
