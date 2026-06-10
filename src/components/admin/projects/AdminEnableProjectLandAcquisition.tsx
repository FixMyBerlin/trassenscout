import { MapIcon } from "@heroicons/react/20/solid"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { AdminTableFeatureSwitch } from "@/src/components/admin/AdminTableActions"
import { updateProjectLandAcquisitionModuleEnabledFn } from "@/src/server/projects/projects.functions"

type Props = {
  slug: string
  landAcquisitionModuleEnabled: boolean
}

export const AdminEnableProjectLandAcquisition = ({
  slug,
  landAcquisitionModuleEnabled,
}: Props) => {
  const [isLandAcquisitionModuleEnabled, setIsLandAcquisitionModuleEnabled] = useState(
    landAcquisitionModuleEnabled,
  )
  const updateProjectMutation = useMutation({
    mutationFn: updateProjectLandAcquisitionModuleEnabledFn,
  })

  const handleClick = async () => {
    const newState = !isLandAcquisitionModuleEnabled
    setIsLandAcquisitionModuleEnabled(newState)
    try {
      await updateProjectMutation.mutateAsync({
        data: {
          landAcquisitionModuleEnabled: newState,
          projectSlug: slug,
        },
      })
    } catch (error: unknown) {
      console.error("Error updating project landAcquisitionModuleEnabled: ", error)
      setIsLandAcquisitionModuleEnabled(!newState)
    }
  }

  return (
    <AdminTableFeatureSwitch
      enabled={isLandAcquisitionModuleEnabled}
      onToggle={() => void handleClick()}
      disabled={updateProjectMutation.isPending}
      label={
        isLandAcquisitionModuleEnabled
          ? "Grunderwerb-Modul ausschalten"
          : "Grunderwerb-Modul einschalten"
      }
      icon={<MapIcon className="size-4" aria-hidden />}
    />
  )
}
