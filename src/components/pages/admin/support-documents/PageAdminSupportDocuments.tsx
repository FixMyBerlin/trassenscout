import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { adminTableEditButtonClassName } from "@/src/components/admin/adminListClasses"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { supportDocumentsQueryOptions } from "@/src/server/supportDocuments/supportDocumentsQueryOptions"

export function PageAdminSupportDocuments() {
  const { data: documents } = useSuspenseQuery(supportDocumentsQueryOptions())

  return (
    <>
      <AdminPageHeader title="Support-Dokumente" />
      <ul className="list-none space-y-6 pl-0">
        {documents.map((document, index) => (
          <li
            key={document.id}
            className={`rounded-lg border border-gray-200 p-4 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
          >
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
                Bearbeiten
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
