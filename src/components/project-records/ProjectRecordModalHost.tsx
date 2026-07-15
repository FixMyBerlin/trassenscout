import { useQueryClient } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { useProjectModalNavigation } from "@/src/components/shared/projectModals/useProjectModalNavigation"
import { projectRecordQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type PreviewProjectRecord = {
  id: number
  title: string
}

export function useProjectRecordModal() {
  const queryClient = useQueryClient()
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const modalSearch = loggedInProjectRouteApi.useSearch()
  const userCanEdit = useUserCan().edit
  const { buildModalHref, updateModalSearch } = useProjectModalNavigation()

  const getProjectRecordDetailHref = ({ projectRecordId }: { projectRecordId: number }) =>
    buildModalHref({
      modalProjectRecordId: projectRecordId,
      modalProjectRecordView: "detail",
    })

  const openProjectRecordDetail = (input: {
    projectRecordId: number
    previewProjectRecord?: PreviewProjectRecord
  }) => {
    void queryClient.ensureQueryData(
      projectRecordQueryOptions({ projectSlug, id: input.projectRecordId }),
    )
    void updateModalSearch(
      {
        modalProjectRecordId: input.projectRecordId,
        modalProjectRecordView: "detail",
      },
      {
        replace: modalSearch.modalProjectRecordId === input.projectRecordId,
        preview: input.previewProjectRecord
          ? { type: "projectRecord", projectRecord: input.previewProjectRecord }
          : undefined,
      },
    )
  }

  const openProjectRecordEdit = (input: { projectRecordId: number }) => {
    if (!userCanEdit) return

    void queryClient.ensureQueryData(
      projectRecordQueryOptions({ projectSlug, id: input.projectRecordId }),
    )
    void updateModalSearch(
      {
        modalProjectRecordId: input.projectRecordId,
        modalProjectRecordView: "edit",
      },
      {
        replace:
          modalSearch.modalProjectRecordId === input.projectRecordId &&
          modalSearch.modalProjectRecordView === "edit",
      },
    )
  }

  return {
    openProjectRecordDetail,
    openProjectRecordEdit,
    getProjectRecordDetailHref,
  }
}
