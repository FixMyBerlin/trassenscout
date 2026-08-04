import { twJoin } from "tailwind-merge"
import { linkStyles } from "@/src/components/core/components/links/styles"

export type ProjectRecordEmailSourceValue = {
  from: string | null
  subject: string | null
  date: Date | null
  textBody: string | null
  uploads: { id: number; title: string }[]
}

type Props = {
  adminView?: boolean
  reviewView?: boolean
  email: ProjectRecordEmailSourceValue
}

const ProjectRecordEmailSourceText = ({ email }: { email: Props["email"] }) => {
  return (
    <div className="space-y-2 text-sm text-gray-700">
      {email.from && (
        <div>
          <span className="font-semibold">Von:</span> <span>{email.from}</span>
        </div>
      )}
      {email.subject && (
        <div>
          <span className="font-semibold">Betreff:</span> <span>{email.subject}</span>
        </div>
      )}
      {email.date && (
        <div>
          <span className="font-semibold">Datum:</span>{" "}
          <span>{new Date(email.date).toLocaleString("de-DE")}</span>
        </div>
      )}
      {email.textBody && (
        <div className="mt-3 max-h-[600px] overflow-y-auto">
          <span className="font-semibold">Nachrichtentext:</span>
          <div className="mt-1 whitespace-pre-wrap">{email.textBody}</div>
        </div>
      )}
      {email.uploads && email.uploads.length > 0 && (
        <div>
          <span className="font-semibold">Anhänge:</span>
          <ul className="mt-1 ml-4 list-disc">
            {email.uploads.map((upload) => (
              <li key={upload.id}>{upload.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export const ProjectRecordEmailSource = ({ email }: Props) => {
  return (
    <div className="w-96 shrink-0 text-sm">
      <h4 className="mb-1 font-medium">Quellnachricht (unverarbeitet)</h4>
      <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-4">
        <ProjectRecordEmailSourceText email={email} />
      </div>
    </div>
  )
}

export const ProjectRecordEmailSourceDisclosure = ({
  email,
  className,
  withHelp = true,
}: {
  email: ProjectRecordEmailSourceValue
  className?: string
  withHelp?: boolean
}) => {
  return (
    <div className={twJoin("space-y-3", className)}>
      <details className="w-full rounded-lg border border-gray-300 px-3 py-2">
        <summary className={twJoin(linkStyles, "cursor-pointer text-sm")}>
          Quellnachricht (unverarbeitet)
        </summary>
        <div className="mt-4">
          <ProjectRecordEmailSourceText email={email} />
        </div>
      </details>
      {withHelp && (
        <p className="text-sm font-normal text-gray-600">
          Die „Quellnachricht“ zeigt die unveränderte E-Mail, bevor die KI sie zusammengefasst hat.
          Nutzen Sie diese Ansicht gern zur Kontrolle, wenn Sie sich bei einzelnen Formulierungen
          oder Inhalten unsicher sind.
        </p>
      )}
    </div>
  )
}
