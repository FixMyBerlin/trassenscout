"use client"
import { blueButtonStyles, Link } from "@/src/core/components/links"
import updateProjectExportApi from "@/src/server/projects/mutations/updateProjectExportApi"
import { useMutation } from "@blitzjs/rpc"
import { useState } from "react"

type Props = {
  slug: string
  exportEnabled: boolean
}

export const AdminEnableProjectExportApi = ({ slug, exportEnabled }: Props) => {
  const [isExportEnabled, setIsExportEnabled] = useState(exportEnabled)
  const [createProjectMutation] = useMutation(updateProjectExportApi)

  const handleEnableExportClick = async () => {
    const newExportEnabledState = !isExportEnabled
    setIsExportEnabled(newExportEnabledState)
    try {
      await createProjectMutation({ exportEnabled: newExportEnabledState, projectSlug: slug })
    } catch (error: any) {
      console.error("Error updating project / enable export: ", error)
      setIsExportEnabled(!newExportEnabledState)
    }
  }

  return (
    <div className="my-3 flex flex-wrap items-center gap-3">
      <button className={blueButtonStyles} onClick={handleEnableExportClick}>
        Export {isExportEnabled ? "ausschalten" : "einschalten"}
      </button>
      <Link
        href={`/api/projects/${slug}.json`}
        blank
        icon="action"
        title={isExportEnabled ? "Export-JSON öffnen" : "Export-API deaktiviert"}
        className={!isExportEnabled ? "line-through" : undefined}
      >
        <span className="sr-only">Export-JSON öffnen</span>
      </Link>
    </div>
  )
}
