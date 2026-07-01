import { DocumentTextIcon } from "@heroicons/react/20/solid"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminTableFeatureSwitch } from "@/src/components/admin/AdminTableActions"
import { updateProjectShowLogEntriesFn } from "@/src/server/projects/projects.functions"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { updateAdminProjectInCache } from "./adminProjectsQueryCache"

type Props = {
  slug: string
  showLogEntries: boolean
}

export const AdminEnableProjectShowLogEntries = ({ slug, showLogEntries }: Props) => {
  const queryClient = useQueryClient()
  const updateProjectMutation = useMutation({ mutationFn: updateProjectShowLogEntriesFn })

  const handleClick = async () => {
    const newState = !showLogEntries
    await queryClient.cancelQueries({
      queryKey: adminProjectsWithCountsQueryOptions().queryKey,
    })
    updateAdminProjectInCache(queryClient, slug, (project) => ({
      ...project,
      showLogEntries: newState,
    }))

    try {
      await updateProjectMutation.mutateAsync({
        data: {
          showLogEntries: newState,
          projectSlug: slug,
        },
      })
      await queryClient.invalidateQueries({
        queryKey: adminProjectsWithCountsQueryOptions().queryKey,
      })
    } catch (error: unknown) {
      console.error("Error updating project showLogEntries: ", error)
      updateAdminProjectInCache(queryClient, slug, (project) => ({
        ...project,
        showLogEntries,
      }))
    }
  }

  return (
    <AdminTableFeatureSwitch
      enabled={showLogEntries}
      onToggle={() => void handleClick()}
      disabled={updateProjectMutation.isPending}
      label={
        showLogEntries
          ? "Log-Einträge für Editoren ausschalten"
          : "Log-Einträge für Editoren einschalten"
      }
      icon={<DocumentTextIcon className="size-4" aria-hidden />}
    />
  )
}
