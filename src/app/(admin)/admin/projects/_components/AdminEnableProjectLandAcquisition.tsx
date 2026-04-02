"use client"
import { blueButtonStyles } from "@/src/core/components/links"
import updateProjectLandAcquisitionModuleEnabled from "@/src/server/projects/mutations/updateProjectLandAcquisitionModuleEnabled"
import { useMutation } from "@blitzjs/rpc"
import { MapIcon } from "@heroicons/react/16/solid"
import { useState } from "react"

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
  const [updateProjectMutation] = useMutation(updateProjectLandAcquisitionModuleEnabled)

  const handleClick = async () => {
    const newState = !isLandAcquisitionModuleEnabled
    setIsLandAcquisitionModuleEnabled(newState)
    try {
      await updateProjectMutation({
        landAcquisitionModuleEnabled: newState,
        projectSlug: slug,
      })
    } catch (error: unknown) {
      console.error("Error updating project landAcquisitionModuleEnabled: ", error)
      setIsLandAcquisitionModuleEnabled(!newState)
    }
  }

  return (
    <div className="my-3">
      <button type="button" className={blueButtonStyles} onClick={handleClick}>
        <MapIcon className="mr-1 inline size-4" />
        Grunderwerb {isLandAcquisitionModuleEnabled ? "ausschalten" : "einschalten"}
      </button>
    </div>
  )
}
