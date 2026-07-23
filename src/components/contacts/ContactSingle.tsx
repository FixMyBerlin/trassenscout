import { LinkMail } from "@/src/components/core/components/links/LinkMail"
import { LinkTel } from "@/src/components/core/components/links/LinkTel"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { ProjectRecordTagsList } from "@/src/components/project-records/ProjectRecordTagsList"
import type { Contact } from "@/src/server/contacts/types"

type Props = {
  contact: Contact
}

export const ContactSingle = ({ contact }: Props) => {
  const labelClassName = "text-sm font-medium text-gray-700"
  const valueClassName = "text-sm text-gray-500"
  const markdownClassName =
    "prose prose-sm max-w-none text-gray-500 prose-p:my-2 prose-p:text-sm prose-ol:my-2 prose-ol:pl-4 prose-ol:leading-tight prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4 prose-ul:leading-tight"

  return (
    <div className="my-6 space-y-3 text-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <section>
          <h4 className={labelClassName}>Position</h4>
          <p className={valueClassName}>{contact.role || "Keine Position hinterlegt"}</p>
        </section>

        <section>
          <h4 className={labelClassName}>Telefon</h4>
          <p className={valueClassName}>
            {contact.phone ? <LinkTel>{contact.phone}</LinkTel> : "Keine Telefonnummer hinterlegt"}
          </p>
        </section>
      </div>

      <section>
        <h4 className={labelClassName}>E-Mail</h4>
        <p className={valueClassName}>
          {contact.email ? (
            <LinkMail subject="Abstimmung zum RS 8">{contact.email}</LinkMail>
          ) : (
            "Keine E-Mail-Adresse hinterlegt"
          )}
        </p>
      </section>

      <section>
        <h4 className={labelClassName}>Notizen</h4>
        {contact.note ? (
          <div className="max-h-60 overflow-y-auto">
            <Markdown className={markdownClassName} markdown={contact.note} />
          </div>
        ) : (
          <p className={valueClassName}>Keine Notizen hinterlegt</p>
        )}
      </section>

      <section>
        <h4 className={labelClassName}>Tags</h4>
        {contact.tags?.length ? (
          <div className="mt-2">
            <ProjectRecordTagsList tags={contact.tags} />
          </div>
        ) : (
          <p className={valueClassName}>Keine Tags zugeordnet</p>
        )}
      </section>
    </div>
  )
}
