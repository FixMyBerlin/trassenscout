import { SparklesIcon } from "@heroicons/react/20/solid"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminTableFeatureSwitch } from "@/src/components/admin/AdminTableActions"
import { updateProjectAiEnabledFn } from "@/src/server/projects/projects.functions"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { updateAdminProjectInCache } from "./adminProjectsQueryCache"

type Props = {
  slug: string
  aiEnabled: boolean
}

export const AdminEnableProjectAi = ({ slug, aiEnabled }: Props) => {
  const queryClient = useQueryClient()
  const updateProjectMutation = useMutation({ mutationFn: updateProjectAiEnabledFn })

  const handleEnableAiClick = async () => {
    const newAiEnabledState = !aiEnabled
    await queryClient.cancelQueries({
      queryKey: adminProjectsWithCountsQueryOptions().queryKey,
    })
    updateAdminProjectInCache(queryClient, slug, (project) => ({
      ...project,
      aiEnabled: newAiEnabledState,
    }))

    try {
      await updateProjectMutation.mutateAsync({
        data: { aiEnabled: newAiEnabledState, projectSlug: slug },
      })
      await queryClient.invalidateQueries({
        queryKey: adminProjectsWithCountsQueryOptions().queryKey,
      })
    } catch (error: unknown) {
      console.error("Error updating project / enable AI: ", error)
      updateAdminProjectInCache(queryClient, slug, (project) => ({
        ...project,
        aiEnabled,
      }))
    }
  }

  return (
    <AdminTableFeatureSwitch
      enabled={aiEnabled}
      onToggle={() => void handleEnableAiClick()}
      disabled={updateProjectMutation.isPending}
      label={
        aiEnabled
          ? "KI-Features ausschalten (E-Mail-Protokoll, KI-Verarbeitung)"
          : "KI-Features einschalten (E-Mail-Protokoll, KI-Verarbeitung)"
      }
      icon={<SparklesIcon className="size-4" aria-hidden />}
    />
  )
}
