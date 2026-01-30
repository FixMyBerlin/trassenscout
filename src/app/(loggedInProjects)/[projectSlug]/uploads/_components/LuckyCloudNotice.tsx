type Props = {
  collaborationUrl: string | null
}

export const LuckyCloudNotice = ({ collaborationUrl }: Props) => {
  if (!collaborationUrl) return null

  return (
    <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
      <p className="font-medium">Hinweis zum Kolaborations-Modus:</p>
      <p className="mt-1">
        Die Nachverfolgung von Änderungen muss manuell pro Datei aktiviert werden:
        <br />
        Dokument → Reiter &quot;Zusammenarbeit&quot; → &quot;Nachverfolgen von Änderungen&quot; →
        &quot;AKTIVIERT für alle&quot;
      </p>
    </div>
  )
}
