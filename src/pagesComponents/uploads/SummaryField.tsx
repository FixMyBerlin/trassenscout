import { LabeledTextareaField } from "@/src/core/components/forms"
import { SparklesIcon } from "@heroicons/react/16/solid"
import { Dispatch, SetStateAction } from "react"
import { useFormContext } from "react-hook-form"

type Props = {
  uploadId?: number
  isGeneratingSummary: boolean
  setIsGeneratingSummary: Dispatch<SetStateAction<boolean>>
}

export const SummaryField = ({ uploadId, isGeneratingSummary, setIsGeneratingSummary }: Props) => {
  const { setValue } = useFormContext()

  const handleSummarize = async () => {
    if (!uploadId) return

    setIsGeneratingSummary(true)
    try {
      const response = await fetch(`/api/uploads/${uploadId}/summarize`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to generate summary")
      }

      const data = (await response.json()) as {
        success: boolean
        uploadId: number
        summary: string
        title: string
      }
      console.log("Summary generated:", data)

      // Set the summary value in the form
      if (data.summary) {
        setValue("summary", data.summary)
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
      <LabeledTextareaField
        help="Bestimmte Dokumentenformate lassen sich sinnvoll mit KI zusammenfassen. Beachten Sie, dass nach Drücken des Buttons eine eventuell bereits vorhandene Zusammenfassung im Textfeld überschrieben wird."
        optional
        rows={12}
        name="summary"
        label="Zusammenfassung"
        disabled={isGeneratingSummary}
      />
      {uploadId && (
        <button
          type="button"
          onClick={handleSummarize}
          disabled={isGeneratingSummary}
          className="absolute right-5 top-8 flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <SparklesIcon className="h-3 w-3" />
          {isGeneratingSummary ? "Generiere..." : "Mit KI zusammenfassen"}
        </button>
      )}
    </div>
  )
}
