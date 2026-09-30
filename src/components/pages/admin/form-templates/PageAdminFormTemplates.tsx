import { useSuspenseQuery } from "@tanstack/react-query"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminFormTemplatesTable } from "@/src/components/admin/form-templates/AdminFormTemplatesTable"
import { adminHeaderActionButtonClassName } from "@/src/components/admin/HeaderWrapper"
import { Link as CoreLink } from "@/src/components/core/components/links/Link"
import { Notice } from "@/src/components/core/components/Notice/Notice"
import { formTemplatesQueryOptions } from "@/src/server/formTemplates/formTemplatesQueryOptions"

export function PageAdminFormTemplates() {
  const { data: templates } = useSuspenseQuery(formTemplatesQueryOptions())
  return (
    <>
      <AdminPageHeader
        title="Vorlagen Formulare"
        action={
          <CoreLink
            to="/admin/form-templates/new"
            button
            icon="plus"
            className={adminHeaderActionButtonClassName}
          >
            Neues Formulartemplate
          </CoreLink>
        }
      />
      <Notice type="warn" title="Vorübergehend ausgeblendet">
        Formulare werden in Protokolleinträgen zurzeit nicht angezeigt. Stattdessen können an
        Protokollvorlagen Dokumente zum Herunterladen hinterlegt werden.
      </Notice>
      <AdminFormTemplatesTable templates={templates} />
    </>
  )
}
