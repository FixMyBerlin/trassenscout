"use client"

import { ReprocessedProtocol } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/[protocolId]/_components/ProtocolDetailClient"
import { reprocessProtocol } from "@/src/app/actions/reprocessProtocol"
import { blueButtonStyles } from "@/src/core/components/links"
import { SparklesIcon } from "@heroicons/react/20/solid"
import { clsx } from "clsx"
import { useState } from "react"

type Props = {
  protocolId: number
  onAiSuggestions: (suggestions: ReprocessedProtocol) => void
}

export const ReprocessProtocolButton = ({ protocolId, onAiSuggestions }: Props) => {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleImproveProtocol = async () => {
    setIsProcessing(true)
    try {
      const data = await reprocessProtocol(protocolId)
      if (data.success && data.aiSuggestions) {
        setIsProcessing(false)
        onAiSuggestions(data.aiSuggestions)
      } else {
        throw new Error("Invalid response data")
      }
    } catch (error) {
      console.error("Error improving protocol:", error)
      alert("Fehler beim Verbessern des Protokolls")
      setIsProcessing(false)
    }
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <SparklesIcon className={"mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"} />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">KI-gestützte Verbesserung</h3>
          <p className="mb-3 mt-1 text-sm text-gray-600">
            Dieses Protokoll kann mit KI verbessert werden. Dabei werden verknüpfte Dokumente und
            deren Zusammenfassungen berücksichtigt.
          </p>
          <button
            type="button"
            onClick={handleImproveProtocol}
            disabled={isProcessing}
            className={clsx(blueButtonStyles, "flex gap-1")}
          >
            <SparklesIcon className="h-4 w-4" />
            {isProcessing ? "Wird verbessert..." : "Protokoll verbessern"}
          </button>
        </div>
      </div>
    </div>
  )
}
