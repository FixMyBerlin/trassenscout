import { PlusIcon } from "@heroicons/react/16/solid"
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { twJoin } from "tailwind-merge"
import { primaryButtonSmClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { FormSuccess } from "@/src/components/core/components/forms/FormSuccess"
import { SelectListbox } from "@/src/components/core/components/forms/SelectListbox"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { PageHeaderSearchFilter } from "@/src/components/core/components/PageHeader/PageHeaderSearchFilter"
import { FilteredProjectRecords } from "@/src/components/project-records/FilteredProjectRecords"
import { ProjectRecordNewModal } from "@/src/components/project-records/ProjectRecordNewModal"
import { useProjectRecordsListHeader } from "@/src/components/project-records/useProjectRecordsListHeader"
import { useProjectRecordFilters } from "@/src/components/project-records/utils/useProjectRecordFilters"
import { deleteMcpDraftFn } from "@/src/server/mcp/mcpDrafts/mcpDrafts.functions"
import {
  invalidateMcpDraftQueries,
  projectRecordMcpDraftQueryOptions,
} from "@/src/server/mcp/mcpDrafts/mcpDraftsQueryOptions"
import {
  projectRecordsQueryOptions,
  projectRecordsTabCountsQueryOptions,
} from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { isMcpDraftSearch } from "@/src/shared/mcp/catalogMcpSearch"
import {
  PROJECT_RECORD_FILTER_DEFAULTS,
  type ProjectRecordFilter,
} from "@/src/shared/projectRecords/searchSchemas"

const statusOptions: { value: ProjectRecordFilter["status"]; label: string }[] = [
  { value: "PENDING", label: "In Bearbeitung" },
  { value: "COMPLETED", label: "Abgeschlossen" },
  { value: "all", label: "Alle Status" },
]

const directionOptions: { value: ProjectRecordFilter["direction"]; label: string }[] = [
  { value: "all", label: "Alle Zuweisungen" },
  { value: "byMe", label: "Von mir zugewiesen" },
  { value: "toMe", label: "An mich zugewiesen" },
]

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")
const recordsRouteApi = getRouteApi("/_loggedInProjects/$projectSlug/project-records")

export const ProjectRecordsFormAndTable = () => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { mcpDraft, ref } = recordsRouteApi.useSearch()
  const applyMcpDraft = isMcpDraftSearch(mcpDraft) && Boolean(ref)
  const mcpDraftQuery = useQuery({
    ...projectRecordMcpDraftQueryOptions({ projectSlug, ref }),
    enabled: applyMcpDraft,
  })
  const discardMcpDraft = useMutation({ mutationFn: deleteMcpDraftFn })
  const { breadcrumb, tabs } = useProjectRecordsListHeader()
  const { filter, setFilter } = useProjectRecordFilters()
  const queryClient = useQueryClient()
  const { data: projectRecords } = useSuspenseQuery(projectRecordsQueryOptions({ projectSlug }))
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProjectRecordId, setCreatedProjectRecordId] = useState<null | number>(null)
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [mcpDraftDismissed, setMcpDraftDismissed] = useState(false)
  const draftReady = applyMcpDraft && mcpDraftQuery.data != null
  const isProjectRecordModalOpen = manualModalOpen || (draftReady && !mcpDraftDismissed)
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
    <>
      <PageHeader
        title="Projektprotokoll"
        titleVisuallyHidden
        breadcrumb={breadcrumb}
        info="Übersicht aller Protokolle zum Sichten, Filtern, Ergänzen, Bearbeiten und Kommentieren."
        tabs={tabs}
        filters={
          <PageHeaderSearchFilter
            formId="projectRecord-filter"
            value={filter?.searchterm ?? ""}
            onChange={(searchterm) => void setFilter({ searchterm })}
            onReset={() => void setFilter(undefined)}
            placeholder="Tags, Titel, Inhalte, Maßnahmen und Zugewiesene durchsuchen"
          >
            <SelectListbox
              className="w-48"
              value={filter?.status ?? PROJECT_RECORD_FILTER_DEFAULTS.status}
              options={statusOptions}
              onChange={(next) => void setFilter({ status: next ?? "all" })}
            />
            <SelectListbox
              className="w-56"
              value={filter?.direction ?? PROJECT_RECORD_FILTER_DEFAULTS.direction}
              options={directionOptions}
              onChange={(next) => void setFilter({ direction: next ?? "all" })}
            />
          </PageHeaderSearchFilter>
        }
        primaryAction={
          <button
            ref={createRecordButtonRef}
            type="button"
            onClick={() => setManualModalOpen(true)}
            className={twJoin(primaryButtonSmClassName, "items-center justify-center gap-1")}
          >
            <PlusIcon className="size-3.5" /> Neuer Protokolleintrag
          </button>
        }
      />
      <div className="relative flex flex-col gap-8">
        <ProjectRecordNewModal
          key={mcpDraftQuery.data?.id ?? "manual"}
          projectSlug={projectSlug}
          landAcquisitionModuleEnabled={
            projectRecords[0]?.project?.landAcquisitionModuleEnabled ?? false
          }
          open={isProjectRecordModalOpen}
          initialValues={
            mcpDraftQuery.data?.formOverlay
              ? {
                  title: mcpDraftQuery.data.formOverlay.title,
                  body: mcpDraftQuery.data.formOverlay.body,
                  editingState: mcpDraftQuery.data.formOverlay.editingState,
                  subsubsectionId: mcpDraftQuery.data.formOverlay.subsubsectionId,
                  assignedToId: mcpDraftQuery.data.formOverlay.assignedToId,
                  tags: mcpDraftQuery.data.formOverlay.tags,
                }
              : undefined
          }
          onClose={() => {
            setManualModalOpen(false)
            setMcpDraftDismissed(true)
          }}
          onSuccess={async (projectRecordId) => {
            if (mcpDraftQuery.data) {
              await discardMcpDraft.mutateAsync({
                data: { projectSlug, id: mcpDraftQuery.data.id },
              })
              await invalidateMcpDraftQueries(queryClient)
            }
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
