"use client"
import { blueButtonStyles } from "@/src/core/components/links"
import updateProjectAiEnabled from "@/src/server/projects/mutations/updateProjectAiEnabled"
import { useMutation } from "@blitzjs/rpc"
import { SparklesIcon } from "@heroicons/react/16/solid"
import { useState } from "react"

type Props = {
  slug: string
  aiEnabled: boolean
}

export const AdminEnableProjectAi = ({ slug, aiEnabled }: Props) => {
  const [isAiEnabled, setIsAiEnabled] = useState(aiEnabled)
  const [updateProjectMutation] = useMutation(updateProjectAiEnabled)

  const handleEnableAiClick = async () => {
    const newAiEnabledState = !isAiEnabled
    setIsAiEnabled(newAiEnabledState)
    try {
      await updateProjectMutation({ aiEnabled: newAiEnabledState, projectSlug: slug })
    } catch (error: any) {
      console.error("Error updating project / enable AI: ", error)
      setIsAiEnabled(!newAiEnabledState)
    }
  }

  return (
    <div className="my-3">
      <button className={blueButtonStyles} onClick={handleEnableAiClick}>
        <SparklesIcon className="mr-1 inline size-4" />
        AI Features {isAiEnabled ? "ausschalten" : "einschalten"}
      </button>
    </div>
  )
}
