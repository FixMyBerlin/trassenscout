import { useRef, useState } from "react"
import type { UploadFileRecordResult } from "@/src/components/uploads/UploadDropzone"

export type UploadSlugAssignment =
  | { kind: "matched"; subsectionSlug: string; subsubsectionSlug: string }
  | { kind: "unmatched" }

/**
 * Tracks Maßnahme slug assignment outcomes for the uploads page only.
 * Separate from the generic upload protocol so other dropzone consumers stay simple.
 */
export const useUploadsPageSlugAssignment = () => {
  const [assignBySlug, setAssignBySlugState] = useState(false)
  const assignBySlugRef = useRef(false)
  const [assignmentsByFilename, setAssignmentsByFilename] = useState<
    Record<string, UploadSlugAssignment>
  >({})

  const setAssignBySlug = (value: boolean) => {
    assignBySlugRef.current = value
    setAssignBySlugState(value)
  }

  const resetAssignments = () => setAssignmentsByFilename({})

  const recordSlugAssignment = (result: UploadFileRecordResult) => {
    if (!assignBySlugRef.current || !result.ok) return

    const matched = result.upload.subsubsections[0]
    setAssignmentsByFilename((previous) => ({
      ...previous,
      [result.file.name]: matched
        ? {
            kind: "matched",
            subsectionSlug: matched.subsection.slug,
            subsubsectionSlug: matched.slug,
          }
        : { kind: "unmatched" },
    }))
  }

  return {
    assignBySlug,
    setAssignBySlug,
    assignmentsByFilename,
    resetAssignments,
    recordSlugAssignment,
  }
}
