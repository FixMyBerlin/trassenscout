import { SuperAdminBox } from "@/src/core/components/AdminBox"

type ProjectRecordEmailSourceProps = {
  adminView?: boolean
  reviewView?: boolean
  email: {
    from: string | null
    subject: string | null
    date: Date | null
    textBody: string | null
  }
}

export const ProjectRecordEmailSourceText = ({
  email,
}: {
  email: ProjectRecordEmailSourceProps["email"]
}) => {
  return (
    <div className="space-y-2 text-sm">
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
          <div className="mt-1 text-xs whitespace-pre-wrap">{email.textBody}</div>
        </div>
      )}
    </div>
  )
}

const ProjectRecordEmailSourceComponent = ({
  email,
}: {
  email: ProjectRecordEmailSourceProps["email"]
}) => (
  <div className="w-96 shrink-0">
    <h4 className="mb-1 text-sm font-medium">Quellnachricht (unverarbeitet)</h4>
    <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-4">
      <ProjectRecordEmailSourceText email={email} />
    </div>
  </div>
)

export const ProjectRecordEmailSource = ({
  email,
  adminView,
  reviewView,
}: ProjectRecordEmailSourceProps) => {
  if (!adminView && !reviewView) return

  if (reviewView) {
    return <ProjectRecordEmailSourceComponent email={email} />
  }

  // Admins always see the email source
  return (
    <SuperAdminBox>
      <ProjectRecordEmailSourceComponent email={email} />
    </SuperAdminBox>
  )
}
