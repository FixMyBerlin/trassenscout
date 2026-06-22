"use client"
import { blueButtonStyles } from "@/src/core/components/links"
import updateProjectEvaluationsEnabled from "@/src/server/projects/mutations/updateProjectEvaluationsEnabled"
import { useMutation } from "@blitzjs/rpc"
import { ChartBarIcon } from "@heroicons/react/16/solid"
import { useState } from "react"

type Props = {
  slug: string
  evaluationsEnabled: boolean
}

export const AdminEnableProjectEvaluations = ({ slug, evaluationsEnabled }: Props) => {
  const [isEvaluationsEnabled, setIsEvaluationsEnabled] = useState(evaluationsEnabled)
  const [updateProjectMutation] = useMutation(updateProjectEvaluationsEnabled)

  const handleClick = async () => {
    const newState = !isEvaluationsEnabled
    setIsEvaluationsEnabled(newState)
    try {
      await updateProjectMutation({
        evaluationsEnabled: newState,
        projectSlug: slug,
      })
    } catch (error: unknown) {
      console.error("Error updating project evaluationsEnabled: ", error)
      setIsEvaluationsEnabled(!newState)
    }
  }

  return (
    <div className="my-3">
      <button type="button" className={blueButtonStyles} onClick={handleClick}>
        <ChartBarIcon className="mr-1 inline size-4" />
        Auswertungen {isEvaluationsEnabled ? "ausschalten" : "einschalten"}
      </button>
    </div>
  )
}
