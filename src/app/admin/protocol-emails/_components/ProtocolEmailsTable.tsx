"use client"

import { Link } from "@/src/core/components/links"
import { ProtocolEmailWithRelations } from "@/src/server/protocol-emails/queries/getProtocolEmails"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  protocolEmails: ProtocolEmailWithRelations[]
}

export const ProtocolEmailsTable = ({ protocolEmails }: Props) => {
  const [processing, setProcessing] = useState<number | null>(null)
  const router = useRouter()

  const handleProcessEmail = async (protocolEmailId: number) => {
    setProcessing(protocolEmailId)
    try {
      const response = await fetch("/api/process-protocol-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // This does not make a lot of sense in a client request, but needed for system calls in the future
          // "process-email-api-key": process.env.INTERNAL_API_SECRET,
        },
        body: JSON.stringify({ protocolEmailId }),
      })

      if (response.ok) {
        const result = (await response.json()) as { protocolId: number }
        alert(`Protokoll erfolgreich erstellt! ID: ${result.protocolId}`)
        router.push("/admin/protocols")
      } else {
        alert("Fehler beim Verarbeiten der E-Mail")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Fehler beim Verarbeiten der E-Mail")
    } finally {
      setProcessing(null)
    }
  }

  if (!protocolEmails.length) {
    return (
      <div className="rounded-md bg-gray-50 p-4">
        <p className="text-gray-500">Noch keine E-Mails vorhanden.</p>
        <Link
          href="/admin/protocol-emails/new"
          className="mt-2 inline-block text-blue-600 hover:text-blue-800"
        >
          Erste E-Mail hinzufügen
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Inhalt (Vorschau)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Erstellt am
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Protokolle
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Aktionen</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {protocolEmails.map((email) => (
            <tr key={email.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">
                <Link
                  href={`/admin/protocol-emails/${email.id}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  #{email.id}
                </Link>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <div className="max-w-xs truncate">{email.text.substring(0, 100)}...</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(email.createdAt).toLocaleDateString("de-DE")}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {email.protocols.length > 0 ? (
                  <ul className="space-y-1">
                    {email.protocols.map((protocol: any) => (
                      <li key={protocol.id}>
                        <Link href={`/admin/protocols/${protocol.id}/review`}>{protocol.id}</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )}
              </td>
              <td className="space-x-2 px-6 py-4 text-right text-sm font-medium">
                <button
                  onClick={() => handleProcessEmail(email.id)}
                  disabled={processing === email.id}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {processing === email.id ? "Verarbeite..." : "Prozessieren"}
                </button>
                <Link
                  href={`/admin/protocol-emails/${email.id}/edit`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Bearbeiten
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bg-gray-50 px-6 py-3">
        <Link
          href="/admin/protocol-emails/new"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Neue E-Mail hinzufügen
        </Link>
      </div>
    </div>
  )
}
