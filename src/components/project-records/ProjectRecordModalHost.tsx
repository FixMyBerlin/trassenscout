import { useQueryClient } from "@tanstack/react-query"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { useProjectModalNavigation } from "@/src/components/shared/projectModals/useProjectModalNavigation"
import { useProjectModalSearch } from "@/src/components/shared/projectModals/useProjectModalSearch"
import { useProjectModalSlug } from "@/src/components/shared/projectModals/useProjectModalSlug"
import { projectRecordQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

type PreviewProjectRecord = {
  id: number
  title: string
}

export function useProjectRecordModal() {
  const queryClient = useQueryClient()
  const projectSlug = useProjectModalSlug()
  const modalSearch = useProjectModalSearch()
  const userCanEdit = useUserCan(projectSlug).edit
  const { buildModalHref, updateModalSearch } = useProjectModalNavigation()

  const prefetchProjectRecord = (projectRecordId: number) => {
    if (!projectSlug) return
    void queryClient.ensureQueryData(
      projectRecordQueryOptions({ projectSlug, id: projectRecordId }),
    )
  }

  const getProjectRecordDetailHref = ({
    projectRecordId,
    forProjectSlug,
  }: {
    projectRecordId: number
    forProjectSlug?: string
  }) =>
    buildModalHref({
      modalProjectRecordId: projectRecordId,
      modalProjectRecordView: "detail",
      modalProjectSlug: forProjectSlug,
    })

  const openProjectRecordDetail = (input: {
    projectRecordId: number
    previewProjectRecord?: PreviewProjectRecord
  }) => {
    prefetchProjectRecord(input.projectRecordId)
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

    prefetchProjectRecord(input.projectRecordId)
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
