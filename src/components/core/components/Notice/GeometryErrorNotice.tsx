import { useState } from "react"
import { Notice } from "@/src/components/core/components/Notice/Notice"
import { shortTitle } from "@/src/components/core/components/text/titles"

type Props = {
  /** Only what the notice renders, so every entity's query shape can feed it. */
  items: { id: number; slug: string }[]
  /** German noun for the entity, e.g. "Planungsabschnitt" / "Planungsabschnitte". */
  labelSingular: string
  labelPlural: string
}

/**
 * Names the entries whose geodata the maps had to skip.
 *
 * Deliberately generic: it says what needs checking, not what is wrong with the coordinates. The
 * validation detail goes to the server log.
 */
export const GeometryErrorNotice = ({ items, labelSingular, labelPlural }: Props) => {
  // Dismissal is per page view on purpose: the data is still broken after a reload, so the
  // warning should come back rather than be silenced for good.
  const [dismissed, setDismissed] = useState(false)

  if (!items.length || dismissed) return null

  const first = items[0]

  return (
    <Notice
      type="warn"
      title="Fehlerhafte Geodaten"
      actionText="Hinweis schließen"
      action={() => setDismissed(true)}
    >
      {items.length === 1 && first ? (
        <p>
          {labelSingular} <strong>{shortTitle(first.slug)}</strong> wird auf der Karte nicht
          angezeigt und muss geprüft werden.
        </p>
      ) : (
        <>
          <p>
            Folgende {labelPlural} werden auf der Karte nicht angezeigt und müssen geprüft werden:
          </p>
          <ul>
            {items.map((item) => (
              <li key={item.id}>{shortTitle(item.slug)}</li>
            ))}
          </ul>
        </>
      )}
      <p>Alle übrigen Angaben sind unverändert nutzbar.</p>
    </Notice>
  )
}
