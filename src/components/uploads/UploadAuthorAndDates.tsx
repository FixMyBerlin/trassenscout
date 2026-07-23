import { twJoin } from "tailwind-merge"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { getFullname } from "@/src/components/core/users/getFullname"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import {
  uploadAlignedLabelClassName,
  uploadAlignedRowClassName,
  uploadAlignedValueClassName,
} from "@/src/components/uploads/uploadAlignedFieldStyles"

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
  const sectionClassName = twJoin(
    "border-t border-gray-200",
    pageContentPaddingClassName,
    className,
  )

  if (variant === "aligned") {
    return (
      <section className={sectionClassName}>
        <div className={uploadAlignedRowClassName}>
          <p className={uploadAlignedLabelClassName}>Erstellt:</p>
          <span className={uploadAlignedValueClassName}>
            {formatAuthorWithTimestamp(createdBy, createdAt)}
          </span>
        </div>
        {updatedBy && updatedAt && (
          <div className={uploadAlignedRowClassName}>
            <p className={uploadAlignedLabelClassName}>Aktualisiert:</p>
            <span className={uploadAlignedValueClassName}>
              {formatAuthorWithTimestamp(updatedBy, updatedAt)}
            </span>
          </div>
        )}
      </section>
    )
  }

  return (
    <section className={sectionClassName}>
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
