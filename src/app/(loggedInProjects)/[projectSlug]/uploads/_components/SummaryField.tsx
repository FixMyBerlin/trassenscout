"use client"

import { isPdf } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { summarizeUpload } from "@/src/app/actions/summarizeUpload"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { LabeledTextareaField } from "@/src/core/components/forms"
import { SparklesIcon } from "@heroicons/react/16/solid"
import { Dispatch, SetStateAction } from "react"
import { useFormContext } from "react-hook-form"

type Props = {
  uploadId: number
  mimeType: string | null
  isGeneratingSummary: boolean
  setIsGeneratingSummary: Dispatch<SetStateAction<boolean>>
}

export const SummaryField = ({
  uploadId,
  mimeType,
  isGeneratingSummary,
  setIsGeneratingSummary,
}: Props) => {
  const { setValue } = useFormContext()

  if (!isPdf(mimeType)) {
    return null
  }

  const handleSummarize = async () => {
    setIsGeneratingSummary(true)
    try {
      const { summary } = await summarizeUpload({ uploadId })
      if (summary) {
        setValue("summary", summary)
      } else {
        throw new Error("Invalid response data")
      }
    } catch (error) {
      console.error("Error generating summary:", error)
      alert("Fehler beim Generieren der Zusammenfassung")
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  return (
    <div className="relative">
      <SuperAdminBox>
        {uploadId && (
          <button
            type="button"
            onClick={handleSummarize}
            disabled={isGeneratingSummary}
            // absolute position only makes sense without SuperAdminBox
            // className="absolute right-5 top-8 flex items-center gap-1 rounded-sm bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
            className="flex items-center gap-1 rounded-sm bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <SparklesIcon className="h-3 w-3" />
            {isGeneratingSummary ? "Generiere..." : "Mit KI zusammenfassen"}
          </button>
        )}
      </SuperAdminBox>
      <LabeledTextareaField
        // commented out as it is an admin feature for now
        // help="PDFs lassen sich mit KI zusammenfassen. Beachten Sie, dass nach Drücken des Buttons eine eventuell bereits vorhandene Zusammenfassung im Textfeld überschrieben wird."
        optional
        rows={12}
        name="summary"
        label="Zusammenfassung"
        disabled={isGeneratingSummary}
      />
    </div>
  )
}
