import { getFullname } from "@/src/components/core/users/getFullname"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"

type User = { firstName: string | null; lastName: string | null } | null

type Props = {
  createdBy: User
  createdAt: Date
  updatedBy?: User
  updatedAt?: Date
  className?: string
}

export const UploadAuthorAndDates = ({
  createdBy,
  createdAt,
  updatedBy,
  updatedAt,
  className,
}: Props) => (
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
