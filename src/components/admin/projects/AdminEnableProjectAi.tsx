import { SparklesIcon } from "@heroicons/react/20/solid"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { AdminTableFeatureSwitch } from "@/src/components/admin/AdminTableActions"
import { updateProjectAiEnabledFn } from "@/src/server/projects/projects.functions"

type Props = {
  slug: string
  aiEnabled: boolean
}

export const AdminEnableProjectAi = ({ slug, aiEnabled }: Props) => {
  const [isAiEnabled, setIsAiEnabled] = useState(aiEnabled)
  const updateProjectMutation = useMutation({ mutationFn: updateProjectAiEnabledFn })

  const handleEnableAiClick = async () => {
    const newAiEnabledState = !isAiEnabled
    setIsAiEnabled(newAiEnabledState)
    try {
      await updateProjectMutation.mutateAsync({
        data: { aiEnabled: newAiEnabledState, projectSlug: slug },
      })
    } catch (error: unknown) {
      console.error("Error updating project / enable AI: ", error)
      setIsAiEnabled(!newAiEnabledState)
    }
  }

  return (
    <AdminTableFeatureSwitch
      enabled={isAiEnabled}
      onToggle={() => void handleEnableAiClick()}
      disabled={updateProjectMutation.isPending}
      label={
        isAiEnabled
          ? "KI-Features ausschalten (E-Mail-Protokoll, KI-Verarbeitung)"
          : "KI-Features einschalten (E-Mail-Protokoll, KI-Verarbeitung)"
      }
      icon={<SparklesIcon className="size-4" aria-hidden />}
    />
  )
}
