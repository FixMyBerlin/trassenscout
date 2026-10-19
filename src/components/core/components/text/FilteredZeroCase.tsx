import { twJoin } from "tailwind-merge"
import { secondaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"

type Props = {
  /** Plural noun for the entries, e.g. "Dokumente". */
  name: string
  onReset: () => void
}

export const FilteredZeroCase = ({ name, onReset }: Props) => {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <p className="text-lg font-semibold text-gray-900">0 Ergebnisse</p>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        Für die ausgewählten Filter gibt es keine passenden {name}. Passen Sie Ihre Suche an oder
        setzen Sie die Filter zurück.
      </p>
      <button type="button" onClick={onReset} className={twJoin(secondaryButtonClassName, "mt-6")}>
        Alle Filter zurücksetzen
      </button>
    </div>
  )
}
