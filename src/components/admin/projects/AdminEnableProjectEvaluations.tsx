import { ChartBarIcon } from "@heroicons/react/20/solid"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminTableFeatureSwitch } from "@/src/components/admin/AdminTableActions"
import { updateProjectEvaluationsEnabledFn } from "@/src/server/projects/projects.functions"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { updateAdminProjectInCache } from "./adminProjectsQueryCache"

type Props = {
  slug: string
  evaluationsEnabled: boolean
}

export const AdminEnableProjectEvaluations = ({ slug, evaluationsEnabled }: Props) => {
  const queryClient = useQueryClient()
  const updateProjectMutation = useMutation({ mutationFn: updateProjectEvaluationsEnabledFn })

  const handleEnableEvaluationsClick = async () => {
    const newEvaluationsEnabledState = !evaluationsEnabled
    await queryClient.cancelQueries({
      queryKey: adminProjectsWithCountsQueryOptions().queryKey,
    })
    updateAdminProjectInCache(queryClient, slug, (project) => ({
      ...project,
      evaluationsEnabled: newEvaluationsEnabledState,
    }))

    try {
      await updateProjectMutation.mutateAsync({
        data: { evaluationsEnabled: newEvaluationsEnabledState, projectSlug: slug },
      })
      await queryClient.invalidateQueries({
        queryKey: adminProjectsWithCountsQueryOptions().queryKey,
      })
      await queryClient.invalidateQueries({
        queryKey: ["projects", slug],
      })
    } catch (error: unknown) {
      console.error("Error updating project / enable evaluations: ", error)
      updateAdminProjectInCache(queryClient, slug, (project) => ({
        ...project,
        evaluationsEnabled,
      }))
    }
  }

  return (
    <AdminTableFeatureSwitch
      enabled={evaluationsEnabled}
      onToggle={() => void handleEnableEvaluationsClick()}
      disabled={updateProjectMutation.isPending}
      label={evaluationsEnabled ? "Auswertungen ausschalten" : "Auswertungen einschalten"}
      icon={<ChartBarIcon className="size-4" aria-hidden />}
    />
  )
}
