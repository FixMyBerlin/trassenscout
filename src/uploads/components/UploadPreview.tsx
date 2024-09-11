/* eslint-disable @next/next/no-img-element */
import { DocumentIcon } from "@heroicons/react/24/outline"
import { Upload } from "@prisma/client"
import { RouteUrlObject } from "blitz"
import { Link } from "src/core/components/links"
import { uploadUrl } from "../utils"

type Props = {
  upload: Upload
  /** @desc No editUrl will hide the edit button */
  editUrl?: RouteUrlObject
  showUploadUrl?: RouteUrlObject
  description?: boolean
}

export const UploadPreview: React.FC<Props> = ({
  upload,
  editUrl,
  showUploadUrl,
  description = true,
}) => {
  const fileType = upload.externalUrl.split(".").at(-1) || "?"
  const isImage = ["png", "jpg"].includes(fileType.toLowerCase())

  return (
    <div key={upload.id} className="relative">
      <Link
        blank
        href={uploadUrl(upload)}
        className="relative flex cursor-pointer flex-col items-start justify-center rounded-md bg-white text-xs hover:bg-gray-50 hover:outline-none hover:ring hover:ring-opacity-50 hover:ring-offset-4"
        title={upload.title}
      >
        <span className="h-40 w-full overflow-hidden rounded-md">
          {isImage ? (
            <img
              alt=""
              src={uploadUrl(upload)}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center bg-gray-50 text-gray-700 hover:text-blue-800">
              <DocumentIcon className="h-20 w-20 opacity-95" />
              <span className="text-md absolute mt-4 font-semibold uppercase">{fileType}</span>
            </div>
          )}
        </span>
        {description && (
          <p
            className="mt-1 w-full flex-none truncate text-left"
            style={editUrl ? { width: "calc(100% - 2.5rem)" } : {}}
          >
            {upload.title || "-"}
          </p>
        )}
      </Link>
      <div className="absolute -bottom-2 right-0">
        {editUrl && (
          <Link
            icon="edit"
            href={editUrl}
            className="rounded border border-transparent hover:border-blue-900"
          >
            <span className="sr-only">Grafik bearbeiten</span>
          </Link>
        )}
        {showUploadUrl && (
          <Link
            icon="delete"
            className="rounded border border-transparent hover:border-blue-900"
            href={showUploadUrl}
          >
            <span className="sr-only">Grafik löschen</span>
          </Link>
        )}
      </div>
    </div>
  )
}
