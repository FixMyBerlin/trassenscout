"use client"

import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneContainer"
import { UploadTable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadTable"
import { whiteButtonStyles } from "@/src/core/components/links"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { H2, H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { useQuery } from "@blitzjs/rpc"
import { ArrowUpTrayIcon } from "@heroicons/react/20/solid"
import { useState } from "react"
import { twMerge } from "tailwind-merge"

type Props = {
  subsectionId: number
}

export const SubsectionUploadsSection = ({ subsectionId }: Props) => {
  const projectSlug = useProjectSlug()
  const [{ uploads }, { refetch: refetchUploads }] = useQuery(getUploadsWithSubsections, {
    projectSlug,
    where: { subsectionId },
  })
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  if (!subsectionId) {
    return null
  }

  return (
    <section className="mt-12">
      <HeadingWithAction className="mb-5">
        <H2>Relevante Dokumente</H2>
        <IfUserCanEdit>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className={twMerge(whiteButtonStyles, "gap-1.5 px-3 py-2")}
          >
            <ArrowUpTrayIcon className="size-4" />
            Hochladen
          </button>
        </IfUserCanEdit>
      </HeadingWithAction>

      <UploadTable
        withAction={false}
        withRelations={false}
        uploads={uploads}
        onDelete={async () => {
          await refetchUploads()
        }}
      />

      <Modal
        open={isUploadModalOpen}
        handleClose={() => setIsUploadModalOpen(false)}
        className="space-y-4 sm:max-w-lg"
      >
        <HeadingWithAction>
          <H3>Dokument hochladen</H3>
          <ModalCloseButton onClose={() => setIsUploadModalOpen(false)} />
        </HeadingWithAction>
        <UploadDropzoneContainer className="p-0">
          <UploadDropzone
            fillContainer
            subsectionId={subsectionId}
            onUploadComplete={async () => {
              await refetchUploads()
              setIsUploadModalOpen(false)
            }}
          />
        </UploadDropzoneContainer>
      </Modal>
    </section>
  )
}
