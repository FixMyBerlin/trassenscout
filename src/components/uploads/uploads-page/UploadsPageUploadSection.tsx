import { useQueryClient } from "@tanstack/react-query"
import type { UploadFileRecordResult } from "@/src/components/uploads/UploadDropzone"
import { UploadsPageDropzone } from "@/src/components/uploads/uploads-page/UploadsPageDropzone"
import { UploadsPageProtocolReport } from "@/src/components/uploads/uploads-page/UploadsPageProtocolReport"
import { useUploadsPageSlugAssignment } from "@/src/components/uploads/uploads-page/useUploadsPageSlugAssignment"
import { useUploadProtocol } from "@/src/components/uploads/useUploadProtocol"
import { uploadsQueryOptions } from "@/src/server/uploads/uploadsQueryOptions"

type Props = {
  projectSlug: string
}

export const UploadsPageUploadSection = ({ projectSlug }: Props) => {
  const queryClient = useQueryClient()
  const protocol = useUploadProtocol({ projectSlug })
  const slugAssignment = useUploadsPageSlugAssignment()

  const handleBatchStart = (files: File[]) => {
    slugAssignment.resetAssignments()
    protocol.startBatch(files)
  }

  const handleFileRecordResult = (result: UploadFileRecordResult) => {
    protocol.recordResult(result)
    slugAssignment.recordSlugAssignment(result)
  }

  const handleDismiss = () => {
    protocol.reset()
    slugAssignment.resetAssignments()
  }

  return (
    <>
      <div className="space-y-3">
        <UploadsPageDropzone
          projectSlug={projectSlug}
          assignSubsubsectionFromFilename={slugAssignment.assignBySlug}
          onBatchStart={handleBatchStart}
          onFileRecordResult={handleFileRecordResult}
          onUploadFail={protocol.recordUploadFails}
          onUploadComplete={async () => {
            await queryClient.invalidateQueries({
              queryKey: uploadsQueryOptions({ projectSlug }).queryKey,
            })
          }}
        />

        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={slugAssignment.assignBySlug}
            onChange={(event) => slugAssignment.setAssignBySlug(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-gray-300 accent-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          />
          <span>
            Maßnahmen automatisch aus Dateinamen zuordnen
            <span className="block text-xs text-gray-500">
              Erwartetes Format: <code>&lt;abschnitt&gt;_&lt;massnahme&gt;_dateiname</code>, z. B.{" "}
              <code>line-3_point-1_foto.jpg</code>
            </span>
          </span>
        </label>
      </div>

      {protocol.hasProtocol && (
        <UploadsPageProtocolReport
          entries={protocol.entries}
          assignmentsByFilename={slugAssignment.assignmentsByFilename}
          finished={protocol.finished}
          onDismiss={handleDismiss}
        />
      )}
    </>
  )
}
