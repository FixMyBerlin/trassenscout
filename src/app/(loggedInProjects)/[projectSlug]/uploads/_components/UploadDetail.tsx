"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Link, whiteButtonStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { uploadEditRoute, uploadsListRoute } from "@/src/core/routes/uploadRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import deleteUpload from "@/src/server/uploads/mutations/deleteUpload"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { clsx } from "clsx"
import { useRouter } from "next/navigation"
import { UploadTable } from "./UploadTable"

type Props = {
  upload: PromiseReturnType<typeof getUploadWithRelations>
}

export const UploadDetail = ({ upload }: Props) => {
  const router = useRouter()
  const projectSlug = useProjectSlug()

  const [deleteUploadMutation] = useMutation(deleteUpload)
  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${upload.id} unwiderruflich löschen?`)) {
      try {
        await deleteUploadMutation({ projectSlug, id: upload.id })
        router.push(uploadsListRoute(projectSlug))
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
          <Link button="blue" href={uploadEditRoute(projectSlug, upload.id)}>
            Bearbeiten
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className={clsx(whiteButtonStyles, "cursor-pointer")}
          >
            Löschen
          </button>
          <Link href={uploadsListRoute(projectSlug)}>Zurück zu Dokumenten</Link>
        </ButtonWrapper>
      </IfUserCanEdit>

      <UploadTable withAction={false} withRelations={true} uploads={[upload]} />

      <SuperAdminLogData data={upload} />
    </>
  )
}
