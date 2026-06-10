import { DocumentTextIcon } from "@heroicons/react/20/solid"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { AdminTableFeatureSwitch } from "@/src/components/admin/AdminTableActions"
import { updateProjectShowLogEntriesFn } from "@/src/server/projects/projects.functions"

type Props = {
  slug: string
  showLogEntries: boolean
}

export const AdminEnableProjectShowLogEntries = ({ slug, showLogEntries }: Props) => {
  const [isShowLogEntries, setIsShowLogEntries] = useState(showLogEntries)
  const updateProjectMutation = useMutation({ mutationFn: updateProjectShowLogEntriesFn })

  const handleClick = async () => {
    const newState = !isShowLogEntries
    setIsShowLogEntries(newState)
    try {
      await updateProjectMutation.mutateAsync({
        data: {
          showLogEntries: newState,
          projectSlug: slug,
        },
      })
    } catch (error: unknown) {
      console.error("Error updating project showLogEntries: ", error)
      setIsShowLogEntries(!newState)
    }
  }

  return (
    <AdminTableFeatureSwitch
      enabled={isShowLogEntries}
      onToggle={() => void handleClick()}
      disabled={updateProjectMutation.isPending}
      label={
        isShowLogEntries
          ? "Log-Einträge für Editoren ausschalten"
          : "Log-Einträge für Editoren einschalten"
      }
      icon={<DocumentTextIcon className="size-4" aria-hidden />}
    />
  )
}
