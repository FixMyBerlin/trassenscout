import { Link } from "@/src/core/components/links"
import { longTitle, shortTitle } from "@/src/core/components/text/titles"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import { formatBerlinTime } from "@/src/core/utils/formatBerlinTime"

type Props = {
  projectSlug: string
  subsection: { slug: string } | null
  subsubsection: { slug: string } | null
  projectRecords: { id: number; title: string; date: Date | null }[] | null
  projectRecordEmail: { createdAt: Date } | null
  className?: string
}

export const UploadVerknuepfungen = ({
  projectSlug,
  subsection,
  subsubsection,
  projectRecords,
  projectRecordEmail,
  className,
}: Props) => {
  const hasSubsection = subsection !== null
  const hasSubsubsection = subsubsection !== null
  const hasProjectRecords = projectRecords != null && projectRecords.length > 0
  const hasProjectRecordEmail = projectRecordEmail !== null
  const hasRelations =
    hasSubsection || hasSubsubsection || hasProjectRecords || hasProjectRecordEmail

  return (
    <section className={className}>
      <h4 className="text-sm font-medium">Verknüpfungen:</h4>
      {hasRelations ? (
        <ul className="mt-1.5 list-inside list-disc space-y-0.5 pl-4 text-sm">
          {hasSubsection && (
            <li>
              <strong className="font-medium">Planungsabschnitt: </strong>
              {shortTitle(subsection!.slug)} ({subsection!.slug})
            </li>
          )}
          {hasSubsubsection && (
            <li>
              <strong className="font-medium">Eintrag:</strong> {longTitle(subsubsection!.slug)}
            </li>
          )}
          {hasProjectRecords && (
            <li>
              <em className="font-medium">Protokolleinträge: </em>
              {projectRecords!.map((record, index) => (
                <>
                  <Link key={record.id} href={projectRecordDetailRoute(projectSlug, record.id)}>
                    {record.title} {record.date && formatBerlinTime(record.date, "P")}
                  </Link>
                  {index < projectRecords!.length - 1 && ", "}
                </>
              ))}
            </li>
          )}
          {hasProjectRecordEmail && (
            <li>
              <strong className="font-medium">E-Mail-Anhang:</strong>{" "}
              {formatBerlinTime(projectRecordEmail!.createdAt, "dd.MM.yyyy, HH:mm")}
            </li>
          )}
        </ul>
      ) : (
        <p className="mt-1.5 text-sm">Dieses Dokument hat keine Verknüpfungen.</p>
      )}
    </section>
  )
}
