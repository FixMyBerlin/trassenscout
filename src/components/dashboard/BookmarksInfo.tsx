import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { BOOKMARKS_DESCRIPTION } from "@/src/components/dashboard/dashboardBookmarks"

const AUTOMATIC_BOOKMARK_OCCASIONS = [
  "als Projektleiter:in an der Maßnahme eingetragen wird",
  "die Maßnahme anlegt oder speichert",
  "ein Protokoll zur Maßnahme anlegt oder bearbeitet",
  "ein Dokument zur Maßnahme hochlädt",
  "eine Grunderwerbsfläche anlegt",
  "ein Protokoll der Maßnahme zugewiesen bekommt oder zuweist",
]

export const BookmarksInfo = () => {
  return (
    <>
      <p>{BOOKMARKS_DESCRIPTION}</p>
      <SuperAdminBox className="mt-4 mb-0">
        <p>Automatisch als Lesezeichen gesetzt wird eine Maßnahme für die Person, die:</p>
        <ul className="list-disc space-y-0.5 pl-4">
          {AUTOMATIC_BOOKMARK_OCCASIONS.map((occasion) => (
            <li key={occasion}>{occasion}</li>
          ))}
        </ul>
        <p>
          Änderungen über MCP oder Import setzen keine Lesezeichen. Ein entferntes Lesezeichen kommt
          beim nächsten dieser Anlässe zurück. Sichtbar ist das alles nur in Projekten mit
          eingeschaltetem Lesezeichen-Schalter.
        </p>
      </SuperAdminBox>
    </>
  )
}
