import { SparklesIcon } from "@heroicons/react/20/solid"
import { getRouteApi } from "@tanstack/react-router"
import { clsx } from "clsx"
import { useState } from "react"
import { blueButtonStyles } from "@/src/components/core/components/links/styles"
import { ReprocessedProjectRecord } from "@/src/components/project-records/ProjectRecordDetailClient"
import { reprocessProjectRecordFn } from "@/src/server/projectRecords/reprocessProjectRecord.functions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  projectRecordId: number
  onAiSuggestions: (suggestions: ReprocessedProjectRecord) => void
}

export const ReprocessProjectRecordButton = ({ projectRecordId, onAiSuggestions }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const { projectSlug } = loggedInProjectRouteApi.useParams()

  const handleImproveProjectRecord = async () => {
    setIsProcessing(true)
    try {
      const data = await reprocessProjectRecordFn({ data: { projectRecordId, projectSlug } })
      if (data.aiSuggestions) {
        setIsProcessing(false)
        onAiSuggestions(data.aiSuggestions)
      } else {
        throw new Error("Invalid response data")
      }
    } catch (error) {
      console.error("Error improving projectRecord:", error)
      alert("Fehler beim Verbessern des Protokolleintrags")
      setIsProcessing(false)
    }
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <SparklesIcon className={"mt-0.5 size-5 shrink-0 text-blue-600"} />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">KI-gestützte Verbesserung</h3>
          <p className="mt-1 mb-3 text-sm text-gray-600">
            Dieses Protokolleintrag kann mit KI verbessert werden. Dabei werden verknüpfte Dokumente
            und deren Zusammenfassungen berücksichtigt.
          </p>
          <button
            type="button"
            onClick={handleImproveProjectRecord}
            disabled={isProcessing}
            className={clsx(blueButtonStyles, "flex gap-1")}
          >
            <SparklesIcon className="size-4" />
            {isProcessing ? "Wird verbessert..." : "Protokolleintrag verbessern"}
          </button>
        </div>
      </div>
    </div>
  )
}
