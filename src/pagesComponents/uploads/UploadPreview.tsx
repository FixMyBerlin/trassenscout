/* eslint-disable @next/next/no-img-element */
import { Link } from "@/src/core/components/links"
import { useUserCan } from "@/src/pagesComponents/memberships/hooks/useUserCan"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import { DocumentIcon } from "@heroicons/react/24/outline"
import { Upload } from "@prisma/client"
import { RouteUrlObject } from "blitz"
import { uploadUrl } from "./utils/uploadUrl"

type Props = {
  upload: Upload
  /** @desc No editUrl will hide the edit button */
  editUrl?: RouteUrlObject
  showUploadUrl?: RouteUrlObject
  description?: boolean
}

export const UploadPreview = ({ upload, editUrl, showUploadUrl, description = true }: Props) => {
  const fileType = upload.externalUrl.split(".").at(-1) || "?"
  const isImage = ["png", "jpg"].includes(fileType.toLowerCase())

  const canEdit = useUserCan().edit
  if (!canEdit) {
    editUrl = undefined
  }

  return (
    <div key={upload.id} className="relative">
      <Link
        blank
        href={uploadUrl(upload)}
        className="hover:ring-opacity-50 relative flex cursor-pointer flex-col items-start justify-center rounded-md bg-white text-xs hover:bg-gray-50 hover:ring hover:ring-offset-4 hover:outline-hidden"
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
      <IfUserCanEdit>
        <div className="absolute right-0 -bottom-2">
          {editUrl && (
            <Link
              icon="edit"
              href={editUrl}
              className="rounded-sm border border-transparent hover:border-blue-900"
            >
              <span className="sr-only">Grafik bearbeiten</span>
            </Link>
          )}
          {showUploadUrl && (
            <Link
              icon="delete"
              className="rounded-sm border border-transparent hover:border-blue-900"
              href={showUploadUrl}
            >
              <span className="sr-only">Grafik löschen</span>
            </Link>
          )}
        </div>
      </IfUserCanEdit>
    </div>
  )
}
