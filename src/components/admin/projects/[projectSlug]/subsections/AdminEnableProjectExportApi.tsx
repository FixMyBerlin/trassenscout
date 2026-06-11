import { ArrowDownTrayIcon } from "@heroicons/react/20/solid"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import {
  AdminTableActions,
  AdminTableExternalLink,
  AdminTableFeatureSwitch,
} from "@/src/components/admin/AdminTableActions"
import { updateProjectExportApiFn } from "@/src/server/projects/projects.functions"

type Props = {
  slug: string
  exportEnabled: boolean
}

export const AdminEnableProjectExportApi = ({ slug, exportEnabled }: Props) => {
  const [isExportEnabled, setIsExportEnabled] = useState(exportEnabled)
  const updateProjectMutation = useMutation({ mutationFn: updateProjectExportApiFn })

  const handleEnableExportClick = async () => {
    const newExportEnabledState = !isExportEnabled
    setIsExportEnabled(newExportEnabledState)
    try {
      await updateProjectMutation.mutateAsync({
        data: { exportEnabled: newExportEnabledState, projectSlug: slug },
      })
    } catch (error: unknown) {
      console.error("Error updating project / enable export: ", error)
      setIsExportEnabled(!newExportEnabledState)
    }
  }

  return (
    <AdminTableActions className="flex items-center justify-start gap-2">
      <AdminTableFeatureSwitch
        enabled={isExportEnabled}
        onToggle={() => void handleEnableExportClick()}
        disabled={updateProjectMutation.isPending}
        label={isExportEnabled ? "Export-API ausschalten" : "Export-API einschalten"}
        icon={<ArrowDownTrayIcon className="size-4" aria-hidden />}
      />
      {isExportEnabled ? (
        <AdminTableExternalLink href={`/api/projects/${slug}.json`}>Test</AdminTableExternalLink>
      ) : null}
    </AdminTableActions>
  )
}
