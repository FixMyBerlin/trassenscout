import { Link } from "@/src/core/components/links"

type Props = {
  collaborationUrl: string | null
}

export const LuckyCloudDocumentLink = ({ collaborationUrl }: Props) => {
  if (!collaborationUrl) return null

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold text-gray-700">Dokument bearbeiten</h3>
      <Link href={collaborationUrl} blank>
        Dokument öffnen (Kollaboration)
      </Link>
    </div>
  )
}
