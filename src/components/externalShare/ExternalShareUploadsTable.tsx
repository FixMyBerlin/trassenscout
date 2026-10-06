import { useState } from "react"
import { twJoin } from "tailwind-merge"
import {
  tableBodyClassName,
  tableCellClassName,
  tableFixedClassName,
  tableHeadCellClassName,
  tableHeadCellRightClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import { Img } from "@/src/components/shared/Img"
import { FileTypeIcon } from "@/src/components/uploads/utils/FileTypeIcon"
import { isImageUpload } from "@/src/components/uploads/utils/getFileType"
import type { ExternalShareUpload } from "@/src/server/externalShare/types"
import { ExternalSharePreviewModal } from "./ExternalSharePreviewModal"

const colWidths = {
  icon: "w-[14%] @xl:w-[6%]",
  title: "min-w-0 w-[50%] @xl:w-[50%]",
  uploaded: "hidden @xl:table-column @xl:w-[20%]",
  action: "w-[36%] @xl:w-[24%]",
} as const

type Props = {
  uploads: ExternalShareUpload[]
  fileUrl: (uploadId: number) => string
  downloadUrl: (uploadId: number) => string
  renderAction: (upload: ExternalShareUpload) => React.ReactNode
}

/** One table for the internal page and the public page, so the editor sees what goes out. */
export const ExternalShareUploadsTable = ({
  uploads,
  fileUrl,
  downloadUrl,
  renderAction,
}: Props) => {
  const [previewUpload, setPreviewUpload] = useState<ExternalShareUpload | null>(null)

  if (!uploads.length) {
    return (
      <div className="px-4 py-3">
        <ZeroCase small visible={uploads.length} name="Dokumente" verb="freigegeben" />
      </div>
    )
  }

  return (
    <>
      <TableWrapper className="@container">
        <table className={tableFixedClassName}>
          <colgroup>
            <col className={colWidths.icon} />
            <col className={colWidths.title} />
            <col className={colWidths.uploaded} />
            <col className={colWidths.action} />
          </colgroup>
          <thead>
            <tr className={tableHeadRowClassName}>
              <th scope="col" className={twJoin(tableHeadCellClassName, "sr-only")}>
                Vorschau
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                Titel
              </th>
              <th scope="col" className={twJoin(tableHeadCellClassName, "hidden @xl:table-cell")}>
                Hochgeladen
              </th>
              <th scope="col" className={tableHeadCellRightClassName}>
                <span className="sr-only">Aktionen</span>
              </th>
            </tr>
          </thead>
          <tbody className={tableBodyClassName}>
            {uploads.map((upload) => (
              <tr key={upload.id} className={tableRowClassName}>
                <td className={twJoin(tableCellClassName, "align-top")}>
                  <button
                    type="button"
                    onClick={() => setPreviewUpload(upload)}
                    className="inline-flex size-12 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    title={`Vorschau: ${upload.title}`}
                  >
                    {isImageUpload({ mimeType: upload.mimeType }) ? (
                      <Img
                        src={fileUrl(upload.id)}
                        alt=""
                        className="pointer-events-none size-full object-contain"
                      />
                    ) : (
                      <FileTypeIcon mimeType={upload.mimeType} className="size-8 text-gray-400" />
                    )}
                  </button>
                </td>
                <td className={twJoin(tableCellClassName, "min-w-0 align-top")}>
                  <button
                    type="button"
                    onClick={() => setPreviewUpload(upload)}
                    className="block min-w-0 cursor-pointer text-left break-all text-blue-500 hover:text-blue-800"
                  >
                    {upload.title}
                  </button>
                </td>
                <td
                  className={twJoin(
                    tableCellClassName,
                    "hidden align-top text-gray-500 @xl:table-cell",
                  )}
                >
                  {formatBerlinTime(upload.createdAt, "dd.MM.yyyy, HH:mm")}
                </td>
                <td
                  className={twJoin(tableCellClassName, "text-right align-top text-sm font-medium")}
                >
                  {renderAction(upload)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
      <ExternalSharePreviewModal
        upload={previewUpload}
        fileUrl={previewUpload ? fileUrl(previewUpload.id) : ""}
        downloadUrl={previewUpload ? downloadUrl(previewUpload.id) : ""}
        onClose={() => setPreviewUpload(null)}
      />
    </>
  )
}
