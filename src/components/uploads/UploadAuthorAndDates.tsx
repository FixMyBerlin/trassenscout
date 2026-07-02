import { twJoin } from "tailwind-merge"
import { getFullname } from "@/src/components/core/users/getFullname"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"

type User = { firstName: string | null; lastName: string | null } | null

type Props = {
  createdBy: User
  createdAt: Date
  updatedBy?: User
  updatedAt?: Date
  className?: string
  variant?: "default" | "aligned"
}

const formatAuthorWithTimestamp = (user: User, timestamp: Date) => {
  const authorLabel = getFullname(user) || "Unbekannt"
  return `${authorLabel} am ${formatBerlinTime(timestamp, "dd.MM.yyyy, HH:mm")}`
}

export const UploadAuthorAndDates = ({
  createdBy,
  createdAt,
  updatedBy,
  updatedAt,
  className,
  variant = "default",
}: Props) => {
  if (variant === "aligned") {
    return (
      <section
        className={twJoin(
          "grid max-w-5xl grid-cols-[minmax(0,160px)_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm sm:text-[15px]",
          className,
        )}
      >
        <span className="font-medium text-gray-700">Erstellt:</span>
        <span className="text-gray-500">{formatAuthorWithTimestamp(createdBy, createdAt)}</span>
        {updatedBy && updatedAt && (
          <>
            <span className="font-medium text-gray-700">Aktualisiert:</span>
            <span className="text-gray-500">{formatAuthorWithTimestamp(updatedBy, updatedAt)}</span>
          </>
        )}
      </section>
    )
  }

  return (
    <section className={className}>
      <p className="text-sm">
        Erstellt
        {createdBy ? <> von {getFullname(createdBy)}</> : " von Unbekannt"} am{" "}
        {formatBerlinTime(createdAt, "dd.MM.yyyy, HH:mm")}
      </p>
      {updatedBy && updatedAt && (
        <p className="mt-1 text-sm">
          Aktualisiert
          {updatedBy ? <> von {getFullname(updatedBy)}</> : " von Unbekannt"} am{" "}
          {formatBerlinTime(updatedAt, "dd.MM.yyyy, HH:mm")}
        </p>
      )}
    </section>
  )
}
