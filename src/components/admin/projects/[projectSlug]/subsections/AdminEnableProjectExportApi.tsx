import { ArrowDownTrayIcon } from "@heroicons/react/20/solid"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AdminTableActions,
  AdminTableExternalLink,
  AdminTableFeatureSwitch,
} from "@/src/components/admin/AdminTableActions"
import { updateProjectExportApiFn } from "@/src/server/projects/projects.functions"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { updateAdminProjectInCache } from "../../adminProjectsQueryCache"

type Props = {
  slug: string
  exportEnabled: boolean
}

export const AdminEnableProjectExportApi = ({ slug, exportEnabled }: Props) => {
  const queryClient = useQueryClient()
  const updateProjectMutation = useMutation({ mutationFn: updateProjectExportApiFn })

  const handleEnableExportClick = async () => {
    const newExportEnabledState = !exportEnabled
    await queryClient.cancelQueries({
      queryKey: adminProjectsWithCountsQueryOptions().queryKey,
    })
    updateAdminProjectInCache(queryClient, slug, (project) => ({
      ...project,
      exportEnabled: newExportEnabledState,
    }))

    try {
      await updateProjectMutation.mutateAsync({
        data: { exportEnabled: newExportEnabledState, projectSlug: slug },
      })
      await queryClient.invalidateQueries({
        queryKey: adminProjectsWithCountsQueryOptions().queryKey,
      })
    } catch (error: unknown) {
      console.error("Error updating project / enable export: ", error)
      updateAdminProjectInCache(queryClient, slug, (project) => ({
        ...project,
        exportEnabled,
      }))
    }
  }

  return (
    <AdminTableActions className="flex items-center justify-start gap-2">
      <AdminTableFeatureSwitch
        enabled={exportEnabled}
        onToggle={() => void handleEnableExportClick()}
        disabled={updateProjectMutation.isPending}
        label={exportEnabled ? "Export-API ausschalten" : "Export-API einschalten"}
        icon={<ArrowDownTrayIcon className="size-4" aria-hidden />}
      />
      {exportEnabled ? (
        <AdminTableExternalLink href={`/api/projects/${slug}.json`}>Test</AdminTableExternalLink>
      ) : null}
    </AdminTableActions>
  )
}
