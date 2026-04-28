"use client"

import { ProjectRecordDetailClient } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordDetailClient"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { Link } from "@/src/core/components/links"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import { projectRecordEditRoute } from "@/src/core/routes/projectRecordRoutes"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { Route } from "next"
import { useRouter, useSearchParams } from "next/navigation"

export const ProjectRecordDetailModalClient = ({
  initialProjectRecord,
}: {
  initialProjectRecord: Awaited<ReturnType<typeof getProjectRecord>>
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromParam = searchParams?.get("from") ?? undefined
  const editPath = projectRecordEditRoute(
    initialProjectRecord.project.slug,
    initialProjectRecord.id,
  )
  const appendFrom = fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""
  const editHref = `${editPath}${appendFrom}`
  const handleClose = () => {
    if (fromParam && fromParam.startsWith("/") && !fromParam.startsWith("//")) {
      router.replace(fromParam as Route, { scroll: false })
      return
    }
    router.back()
  }

  return (
    <Modal open align="right" handleClose={handleClose} className="space-y-4">
      <HeadingWithAction>
        <H3>{initialProjectRecord.title}</H3>
        <div className="flex items-center gap-4">
          <IfUserCanEdit>
            <Link icon="edit" href={editHref} scroll={false}>
              Bearbeiten
            </Link>
          </IfUserCanEdit>
          <ModalCloseButton onClose={handleClose} />
        </div>
      </HeadingWithAction>

      <ProjectRecordDetailClient initialProjectRecord={initialProjectRecord} />
    </Modal>
  )
}
