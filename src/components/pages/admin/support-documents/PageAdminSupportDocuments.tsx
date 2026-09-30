import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  adminStackedListClassName,
  adminTableEditButtonClassName,
} from "@/src/components/admin/adminListClasses"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { supportDocumentsQueryOptions } from "@/src/server/supportDocuments/supportDocumentsQueryOptions"

export function PageAdminSupportDocuments() {
  const { data: documents } = useSuspenseQuery(supportDocumentsQueryOptions())

  return (
    <>
      <AdminPageHeader title="Support-Dokumente" />
      <ul className={adminStackedListClassName}>
        {documents.map((document) => (
          <li key={document.id}>
            <div className="flex items-start justify-between gap-4">
              <h2 className="mt-1 font-semibold">{document.title}</h2>
              <span className="text-sm text-gray-500">Reihenfolge: {document.order}</span>
            </div>
            {document.description && (
              <p className="mt-1 text-sm text-gray-600">{document.description}</p>
            )}
            <div className="mt-3">
              <Link
                className={adminTableEditButtonClassName}
                to="/admin/support-documents/$supportDocumentId/edit"
                params={{ supportDocumentId: String(document.id) }}
              >
                bearbeiten
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
