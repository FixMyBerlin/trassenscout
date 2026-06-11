import { PlusIcon } from "@heroicons/react/16/solid"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { twJoin } from "tailwind-merge"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { FormSuccess } from "@/src/components/core/components/forms/FormSuccess"
import { FilteredProjectRecords } from "@/src/components/project-records/FilteredProjectRecords"
import { ProjectRecordNewModal } from "@/src/components/project-records/ProjectRecordNewModal"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { projectRecordsQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export const ProjectRecordsFormAndTable = () => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const queryClient = useQueryClient()
  const { data: projectRecords } = useSuspenseQuery(projectRecordsQueryOptions({ projectSlug }))
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProjectRecordId, setCreatedProjectRecordId] = useState<null | number>(null)
  const [isProjectRecordModalOpen, setIsProjectRecordModalOpen] = useState(false)
  const createRecordButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(function markCreateRecordButtonReadyAfterHydration() {
    createRecordButtonRef.current?.setAttribute("data-create-record-ready", "true")
  }, [])

  useEffect(() => {
    if (showSuccess) {
      const timeout = setTimeout(() => {
        setShowSuccess(false)
        setCreatedProjectRecordId(null)
      }, 4000)
      return () => clearTimeout(timeout)
    }
  }, [showSuccess])

  return (
    <div className="relative flex flex-col gap-8">
      <IfUserCanEdit>
        <div>
          <button
            ref={createRecordButtonRef}
            type="button"
            onClick={() => setIsProjectRecordModalOpen(true)}
            className={twJoin(primaryButtonClassName, "items-center justify-center gap-1")}
          >
            <PlusIcon className="size-3.5" /> Neuer Protokolleintrag
          </button>
        </div>
      </IfUserCanEdit>

      <ProjectRecordNewModal
        projectSlug={projectSlug}
        landAcquisitionModuleEnabled={
          projectRecords[0]?.project?.landAcquisitionModuleEnabled ?? false
        }
        open={isProjectRecordModalOpen}
        onClose={() => setIsProjectRecordModalOpen(false)}
        onSuccess={async (projectRecordId) => {
          setCreatedProjectRecordId(projectRecordId)
          setShowSuccess(true)
          setTimeout(() => {
            setShowSuccess(false)
            setCreatedProjectRecordId(null)
          }, 3000)
          await queryClient.invalidateQueries({
            queryKey: projectRecordsQueryOptions({ projectSlug }).queryKey,
          })
        }}
      />
      <div className="absolute top-0 right-0">
        <FormSuccess message="Neuen Protokolleintrag erstellt" show={showSuccess} />
      </div>
      <FilteredProjectRecords
        highlightId={createdProjectRecordId}
        projectRecords={projectRecords}
      />
    </div>
  )
}
