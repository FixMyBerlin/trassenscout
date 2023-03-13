import clsx from "clsx"
import { useFormContext } from "react-hook-form"
import { z } from "zod"

type Props = { name: string }

export const GeometryValidation: React.FC<Props> = ({ name }) => {
  const { watch } = useFormContext()
  const watchwatch = watch(name)

  let watchJson = []
  try {
    watchJson = JSON.parse(watchwatch)
  } catch {}

  const LineStringSchema = z.array(z.array(z.number()).min(2).max(2).nonempty()).nonempty()

  const schemaResult = LineStringSchema.safeParse(watchJson)

  return (
    <div
      className={clsx(
        "my-10 rounded border p-3 text-gray-700",
        schemaResult.success ? "bg-gray-100" : "border-pink-800 bg-pink-100"
      )}
    >
      <h3 className="m-0 text-sm">Geometrieprüfung:</h3>
      {schemaResult.success ? (
        <pre className="m-0 text-xs leading-none">{JSON.stringify(watchJson, undefined, 2)}</pre>
      ) : (
        <>
          <p className="mt-2 mb-0 text-sm">
            Ungültiger <code>LineString</code>. Das Format muss sein:
            <code>[[9.1943,48.8932],[9.2043,48.8933]]</code>
          </p>
          <p className="mt-2 mb-0 text-sm">
            <strong>Achtung Validierung:</strong> Dieser Fehler muss behoben werden. Aus technischen
            Gründen kann man das Formular trotzdem speichern. Das würde dann aber zu einer defekten
            Appliation führen.
          </p>
        </>
      )}
    </div>
  )
}
