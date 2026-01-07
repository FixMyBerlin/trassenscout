type ProjectRecordEmailSourceProps = {
  adminView?: boolean
  reviewView?: boolean
  email: {
    from: string | null
    subject: string | null
    date: Date | null
    textBody: string | null
    uploads: { id: number; title: string }[]
  }
}

export const ProjectRecordEmailSourceText = ({
  email,
}: {
  email: ProjectRecordEmailSourceProps["email"]
}) => {
  return (
    <div className="space-y-2">
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

export const ProjectRecordEmailSource = ({ email }: ProjectRecordEmailSourceProps) => {
  return (
    <div className="w-96 shrink-0 text-xs">
      <h4 className="mb-1 font-medium">Quellnachricht (unverarbeitet)</h4>
      <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-4">
        <ProjectRecordEmailSourceText email={email} />
      </div>
    </div>
  )
}
