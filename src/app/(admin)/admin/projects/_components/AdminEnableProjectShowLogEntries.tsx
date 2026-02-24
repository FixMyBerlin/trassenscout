"use client"
import { blueButtonStyles } from "@/src/core/components/links"
import updateProjectShowLogEntries from "@/src/server/projects/mutations/updateProjectShowLogEntries"
import { useMutation } from "@blitzjs/rpc"
import { DocumentTextIcon } from "@heroicons/react/16/solid"
import { useState } from "react"

type Props = {
  slug: string
  showLogEntries: boolean
}

export const AdminEnableProjectShowLogEntries = ({ slug, showLogEntries }: Props) => {
  const [isShowLogEntries, setIsShowLogEntries] = useState(showLogEntries)
  const [updateProjectMutation] = useMutation(updateProjectShowLogEntries)

  const handleClick = async () => {
    const newState = !isShowLogEntries
    setIsShowLogEntries(newState)
    try {
      await updateProjectMutation({
        showLogEntries: newState,
        projectSlug: slug,
      })
    } catch (error: unknown) {
      console.error("Error updating project showLogEntries: ", error)
      setIsShowLogEntries(!newState)
    }
  }

  return (
    <div className="my-3">
      <button type="button" className={blueButtonStyles} onClick={handleClick}>
        <DocumentTextIcon className="mr-1 inline size-4" />
        Log-Einträge für Editoren {isShowLogEntries ? "ausschalten" : "einschalten"}
      </button>
    </div>
  )
}
