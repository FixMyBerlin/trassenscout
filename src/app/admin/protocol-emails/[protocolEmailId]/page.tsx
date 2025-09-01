import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProtocolEmail from "@/src/server/protocol-emails/queries/getProtocolEmail"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Protokoll-E-Mail",
}

export default async function ProtocolEmailDetailPage({
  params,
}: {
  params: { protocolEmailId: string }
}) {
  const protocolEmailId = parseInt(params.protocolEmailId)
  const protocolEmail = await invoke(getProtocolEmail, {
    id: protocolEmailId,
  })

  return (
    <>
      <PageHeader title={`Protokoll-E-Mail #${protocolEmail.id}`} className="mt-12" />

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Erstellt am</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {new Date(protocolEmail.createdAt).toLocaleDateString("de-DE")}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Verknüpfte Protokolle</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {protocolEmail.protocols.length > 0 ? (
                  <div className="space-y-2">
                    {protocolEmail.protocols.map((protocol: any) => (
                      <div key={protocol.id}>
                        <span className="text-blue-600">{protocol.title}</span>
                        {protocol.author && (
                          <span className="ml-2 text-gray-500">
                            von {protocol.author.firstName} {protocol.author.lastName}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  "Keine verknüpften Protokolle"
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">E-Mail-Inhalt</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap">{protocolEmail.text}</pre>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Link href="/admin/protocol-emails">← Zurück zur E-Mail-Übersicht</Link>
        <Link
          href={`/admin/protocol-emails/${protocolEmailId}/edit`}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Bearbeiten
        </Link>
      </div>
    </>
  )
}
