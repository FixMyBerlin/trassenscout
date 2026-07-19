import { PlusIcon } from "@heroicons/react/16/solid"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { twJoin } from "tailwind-merge"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { FormSuccess } from "@/src/components/core/components/forms/FormSuccess"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { PageHeaderSearchFilter } from "@/src/components/core/components/pages/PageHeaderSearchFilter"
import { FilteredProjectRecords } from "@/src/components/project-records/FilteredProjectRecords"
import { ProjectRecordNewModal } from "@/src/components/project-records/ProjectRecordNewModal"
import { useProjectRecordsListHeader } from "@/src/components/project-records/useProjectRecordsListHeader"
import { useProjectRecordFilters } from "@/src/components/project-records/utils/useProjectRecordFilters"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import {
  projectRecordsQueryOptions,
  projectRecordsTabCountsQueryOptions,
} from "@/src/server/projectRecords/projectRecordsQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export const ProjectRecordsFormAndTable = () => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { breadcrumb, tabs } = useProjectRecordsListHeader()
  const { filter, setFilter } = useProjectRecordFilters()
  const canEdit = useUserCan().edit
  const queryClient = useQueryClient()
  const { data: projectRecords } = useSuspenseQuery(projectRecordsQueryOptions({ projectSlug }))
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProjectRecordId, setCreatedProjectRecordId] = useState<null | number>(null)
  const [isProjectRecordModalOpen, setIsProjectRecordModalOpen] = useState(false)
  const createRecordButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(
    function markCreateRecordButtonReadyAfterHydration() {
      createRecordButtonRef.current?.setAttribute("data-create-record-ready", "true")
    },
    [canEdit],
  )
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
    <>
      <PageHeader
        breadcrumb={breadcrumb}
        tabs={tabs}
        filters={
          <PageHeaderSearchFilter
            formId="projectRecord-filter"
            value={filter?.searchterm ?? ""}
            onChange={(searchterm) => setFilter({ searchterm })}
            onReset={() => void setFilter({ searchterm: "" })}
            placeholder="Beiträge nach Suchwort filtern"
            hint="Tags, Titel, Inhalte, Maßnahmen und Zugewiesene durchsuchen"
          />
        }
        primaryAction={
          canEdit ? (
            <button
              ref={createRecordButtonRef}
              type="button"
              onClick={() => setIsProjectRecordModalOpen(true)}
              className={twJoin(primaryButtonClassName, "items-center justify-center gap-1")}
            >
              <PlusIcon className="size-3.5" /> Neuer Protokolleintrag
            </button>
          ) : undefined
        }
      />
      <div className="relative flex flex-col gap-8">
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
            await Promise.all([
              queryClient.invalidateQueries({
                queryKey: projectRecordsQueryOptions({ projectSlug }).queryKey,
              }),
              queryClient.invalidateQueries({
                queryKey: projectRecordsTabCountsQueryOptions({ projectSlug }).queryKey,
              }),
            ])
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
    </>
  )
}
