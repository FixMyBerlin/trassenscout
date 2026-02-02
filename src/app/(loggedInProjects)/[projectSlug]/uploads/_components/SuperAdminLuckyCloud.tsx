import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Link } from "@/src/core/components/links"
import { uploadUrl } from "./utils/uploadUrl"

type Props = {
  upload: {
    id: number
    externalUrl: string
    collaborationUrl: string | null
    collaborationPath: string | null
  }
  projectSlug: string
}

export const SuperAdminLuckyCloud = ({ upload, projectSlug }: Props) => {
  if (!upload.collaborationUrl) return null

  return (
    <SuperAdminBox>
      <ul className="space-y-4">
        <li>
          <p className="mb-1 text-sm font-medium text-gray-700">Kollaborations-URL (Luckycloud):</p>
          <code className="block rounded bg-gray-100 p-2 text-xs text-gray-800">
            {upload.collaborationUrl}
          </code>
        </li>
        <li>
          <p className="mb-1 text-sm font-medium text-gray-700">
            Kollaborations-Pfad (Luckycloud):
          </p>
          <code className="block rounded bg-gray-100 p-2 text-xs text-gray-800">
            {upload.collaborationPath || "(nicht gesetzt)"}
          </code>
        </li>
        <li>
          <Link href={uploadUrl(upload, projectSlug)} blank>
            Original S3 Datei öffnen
          </Link>
        </li>
      </ul>
    </SuperAdminBox>
  )
}
