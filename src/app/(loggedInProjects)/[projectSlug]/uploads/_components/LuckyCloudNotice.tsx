import { isTextDocument } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"

type Props = {
  collaborationUrl: string | null
  mimeType: string | null
}

export const LuckyCloudNotice = ({ collaborationUrl, mimeType }: Props) => {
  if (!collaborationUrl) return null
  if (!isTextDocument(mimeType)) return null

  return (
    <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
      <p className="font-medium">Hinweis zum Kolaborations-Modus:</p>
      <p className="mt-1">
        Die Nachverfolgung von Änderungen in Text-Dokumenten muss manuell pro Datei aktiviert
        werden:
        <br />
        Dokument → Reiter &quot;Zusammenarbeit&quot; → &quot;Nachverfolgen von Änderungen&quot; →
        &quot;AKTIVIERT für alle&quot;
      </p>
    </div>
  )
}
