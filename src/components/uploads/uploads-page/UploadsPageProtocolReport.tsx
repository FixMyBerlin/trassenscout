import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid"
import { getRouteApi, Link } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { translateServerError } from "@/src/components/core/components/forms/errorMessageTranslations"
import { SpinnerIcon } from "@/src/components/core/components/Spinner"
import type { UploadProtocolEntry } from "@/src/components/uploads/useUploadProtocol"
import type { UploadSlugAssignment } from "./useUploadsPageSlugAssignment"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  entries: UploadProtocolEntry[]
  assignmentsByFilename: Record<string, UploadSlugAssignment>
  finished: boolean
  onDismiss: () => void
}

const summaryLine = (
  entries: UploadProtocolEntry[],
  assignmentsByFilename: Record<string, UploadSlugAssignment>,
) => {
  const total = entries.length
  const success = entries.filter((entry) => entry.status === "success").length
  const failed = entries.filter(
    (entry) => entry.status === "uploadFailed" || entry.status === "recordFailed",
  ).length
  const collisions = entries.filter(
    (entry) => entry.collidesWithExisting || entry.collidesInBatch,
  ).length
  const matched = Object.values(assignmentsByFilename).filter(
    (assignment) => assignment.kind === "matched",
  ).length
  const unmatched = Object.values(assignmentsByFilename).filter(
    (assignment) => assignment.kind === "unmatched",
  ).length
  const withAssignment = matched + unmatched > 0

  const parts = [
    `${success} von ${total} ${total === 1 ? "Datei" : "Dateien"} hochgeladen${failed ? `, ${failed} fehlgeschlagen` : ""}`,
    `${collisions} ${collisions === 1 ? "Namenskonflikt" : "Namenskonflikte"}`,
  ]
  if (withAssignment) {
    parts.push(
      `${matched} ${matched === 1 ? "Maßnahme" : "Maßnahmen"} zugeordnet${unmatched ? `, ${unmatched} ohne Zuordnung` : ""}`,
    )
  }
  return parts.join(" · ")
}

export const UploadsPageProtocolReport = ({
  entries,
  assignmentsByFilename,
  finished,
  onDismiss,
}: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()

  return (
    <section
      aria-label="Upload-Protokoll"
      className="rounded-lg border border-gray-300 bg-white p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Upload-Protokoll</h3>
          <p className="mt-1 text-sm text-gray-500">
            {finished ? summaryLine(entries, assignmentsByFilename) : "Upload läuft…"}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-1 hover:bg-gray-100"
          aria-label="Protokoll schließen"
        >
          <XMarkIcon className="size-5 text-gray-500" />
        </button>
      </div>

      <ul className="-mx-2 mt-3 divide-y divide-gray-100">
        {entries.map((entry, index) => {
          const isFailed = entry.status === "uploadFailed" || entry.status === "recordFailed"
          const slugAssignment = assignmentsByFilename[entry.filename]
          const isUnmatched = slugAssignment?.kind === "unmatched"
          return (
            <li
              key={`${entry.filename}-${index}`}
              className={twJoin(
                "flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md px-2 py-2 text-sm",
                isUnmatched && "bg-amber-50",
              )}
            >
              {entry.status === "pending" && <SpinnerIcon size="5" className="shrink-0" />}
              {entry.status === "success" && (
                <CheckCircleIcon className="size-4 shrink-0 text-green-600" />
              )}
              {isFailed && <XCircleIcon className="size-4 shrink-0 text-red-600" />}

              <span className="min-w-0 truncate font-medium">{entry.filename}</span>

              {(entry.collidesWithExisting || entry.collidesInBatch) && (
                <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                  <ExclamationTriangleIcon className="size-3.5" />
                  {entry.collidesWithExisting && entry.collidesInBatch
                    ? "Dateiname existiert bereits und ist mehrfach in dieser Auswahl"
                    : entry.collidesWithExisting
                      ? "Dateiname existiert bereits im Projekt"
                      : "Dateiname mehrfach in dieser Auswahl"}
                </span>
              )}

              {slugAssignment?.kind === "matched" && (
                <span className="text-xs text-gray-500">
                  Zugeordnet:{" "}
                  <Link
                    to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
                    params={{
                      projectSlug,
                      subsectionSlug: slugAssignment.subsectionSlug,
                      subsubsectionSlug: slugAssignment.subsubsectionSlug,
                    }}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {slugAssignment.subsectionSlug}/{slugAssignment.subsubsectionSlug}
                  </Link>
                </span>
              )}
              {isUnmatched && (
                <span className="text-xs text-amber-800">Keine passende Maßnahme gefunden</span>
              )}

              {isFailed && (
                <span className="text-xs text-red-600">
                  {entry.errorMessage ? translateServerError(entry.errorMessage) : "Fehlgeschlagen"}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
