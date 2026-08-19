import { useId, useState } from "react"
import { twJoin } from "tailwind-merge"
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/src/components/core/components/buttons/buttonStyles"
import { FormModal } from "@/src/components/core/components/Modal/FormModal"
import type {
  UploadFilenameConflict,
  UploadFilenameConflictChoice,
  UploadFilenameConflictResolution,
} from "./uploadFilenameConflicts"

type Props = {
  collisions: UploadFilenameConflict[]
  onChoose: (choice: UploadFilenameConflictChoice) => void
}

/**
 * A collision is matched against the stored filename *or* the editable title, so the upload
 * being replaced may carry a different name than the picked file. Naming it only then keeps
 * the dialog quiet in the usual case, where the title still is the original filename.
 */
const renamedTitle = ({ filename, existingUpload }: UploadFilenameConflict) =>
  existingUpload.title === filename ? null : existingUpload.title

const options: { value: UploadFilenameConflictResolution; label: string; hint: string }[] = [
  {
    value: "replace",
    label: "Vorhandene Datei ersetzen",
    hint: "Titel, Verknüpfungen und Tags bleiben erhalten.",
  },
  {
    value: "keepBoth",
    label: "Beide Dateien behalten",
    hint: "Die neue Datei erhält einen Zusatz im Dateinamen.",
  },
]

export function UploadFilenameConflictDialog({ collisions, onChoose }: Props) {
  const [choice, setChoice] = useState<UploadFilenameConflictResolution>("replace")
  const radioGroupName = useId()
  const firstCollision = collisions[0]
  const hasSingleCollision = collisions.length === 1

  return (
    <FormModal title="Upload-Optionen" onClose={() => onChoose("cancel")} className="sm:max-w-lg">
      <div className="px-5 pb-5 text-left">
        {/* The single case names the file in the sentence; a list would only repeat it. */}
        {hasSingleCollision && firstCollision ? (
          <p className="text-sm break-words text-gray-600">
            <span className="font-medium text-gray-900">{firstCollision.filename}</span> ist in
            diesem Projekt bereits vorhanden
            {renamedTitle(firstCollision) ? ` als „${renamedTitle(firstCollision)}“` : ""}.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              {collisions.length} Dateien sind in diesem Projekt bereits vorhanden:
            </p>
            <ul className="mt-2 max-h-40 list-inside list-disc overflow-y-auto text-sm text-gray-900">
              {collisions.map((collision) => (
                <li key={collision.existingUpload.id} className="truncate">
                  {collision.filename}
                  {renamedTitle(collision) ? (
                    <span className="text-gray-500">
                      {" "}
                      — vorhanden als „{renamedTitle(collision)}“
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        )}

        <fieldset className="mt-4">
          <legend className="sr-only">Upload-Optionen</legend>
          <div className="space-y-3">
            {options.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  name={radioGroupName}
                  value={option.value}
                  checked={choice === option.value}
                  onChange={() => setChoice(option.value)}
                  className="mt-0.5 size-4 shrink-0 cursor-pointer border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  {option.label}
                  <span className="block text-xs text-gray-500">{option.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={twJoin(secondaryButtonClassName, "shadow-none")}
            onClick={() => onChoose("cancel")}
          >
            Abbrechen
          </button>
          <button
            type="button"
            className={twJoin(primaryButtonClassName, "shadow-none")}
            onClick={() => onChoose(choice)}
          >
            Hochladen
          </button>
        </div>
      </div>
    </FormModal>
  )
}
