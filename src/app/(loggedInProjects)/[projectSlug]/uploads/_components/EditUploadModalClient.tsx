"use client"

import { EditUploadForm } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/EditUploadForm"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { Route } from "next"
import { useRouter } from "next/navigation"

type Props = {
  upload: Awaited<ReturnType<typeof getUploadWithRelations>>
  returnPath: Route
  returnText: string
}

export const EditUploadModalClient = ({ upload, returnPath, returnText }: Props) => {
  const router = useRouter()
  const handleClose = () => router.back()

  return (
    <Modal open align="right" handleClose={handleClose} className="space-y-4">
      <HeadingWithAction>
        <H3>Dokument bearbeiten</H3>
        <ModalCloseButton onClose={handleClose} />
      </HeadingWithAction>

      <EditUploadForm upload={upload} returnPath={returnPath} returnText={returnText} />
    </Modal>
  )
}
