import { getFileIcon } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileIcon"
import { Upload } from "@prisma/client"

type Props = {
  upload: Pick<Upload, "mimeType">
}

export const UploadMarkerIcon = ({ upload }: Props) => {
  const Icon = getFileIcon(upload.mimeType)

  return (
    <div className="flex items-center justify-center rounded-full bg-white p-1.5 shadow-md ring-1 ring-gray-300">
      <Icon className="h-4 w-4 text-gray-700" />
    </div>
  )
}
