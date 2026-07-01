import { MapIcon } from "@heroicons/react/20/solid"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminTableFeatureSwitch } from "@/src/components/admin/AdminTableActions"
import { updateProjectLandAcquisitionModuleEnabledFn } from "@/src/server/projects/projects.functions"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { updateAdminProjectInCache } from "./adminProjectsQueryCache"

type Props = {
  slug: string
  landAcquisitionModuleEnabled: boolean
}

export const AdminEnableProjectLandAcquisition = ({
  slug,
  landAcquisitionModuleEnabled,
}: Props) => {
  const queryClient = useQueryClient()
  const updateProjectMutation = useMutation({
    mutationFn: updateProjectLandAcquisitionModuleEnabledFn,
  })

  const handleClick = async () => {
    const newState = !landAcquisitionModuleEnabled
    await queryClient.cancelQueries({
      queryKey: adminProjectsWithCountsQueryOptions().queryKey,
    })
    updateAdminProjectInCache(queryClient, slug, (project) => ({
      ...project,
      landAcquisitionModuleEnabled: newState,
    }))

    try {
      await updateProjectMutation.mutateAsync({
        data: {
          landAcquisitionModuleEnabled: newState,
          projectSlug: slug,
        },
      })
      await queryClient.invalidateQueries({
        queryKey: adminProjectsWithCountsQueryOptions().queryKey,
      })
    } catch (error: unknown) {
      console.error("Error updating project landAcquisitionModuleEnabled: ", error)
      updateAdminProjectInCache(queryClient, slug, (project) => ({
        ...project,
        landAcquisitionModuleEnabled,
      }))
    }
  }

  return (
    <AdminTableFeatureSwitch
      enabled={landAcquisitionModuleEnabled}
      onToggle={() => void handleClick()}
      disabled={updateProjectMutation.isPending}
      label={
        landAcquisitionModuleEnabled
          ? "Grunderwerb-Modul ausschalten"
          : "Grunderwerb-Modul einschalten"
      }
      icon={<MapIcon className="size-4" aria-hidden />}
    />
  )
}
