import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { AdminBadge } from "@/src/components/admin/AdminBadge"
import {
  adminTableBodyClassName,
  adminTableCellClassName,
  adminTableClassName,
  adminTableHeadRowClassName,
  adminTableHeaderClassName,
  adminTableRowClassName,
} from "@/src/components/admin/adminListClasses"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { translateServerError } from "@/src/components/core/components/forms/errorMessageTranslations"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import {
  createAdminApiTokenFn,
  revokeAdminApiTokenFn,
} from "@/src/server/admin/adminApiTokens.functions"
import { buildMcpCursorConfigJson, mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { McpCursorConfigPreview } from "./McpCursorConfigPreview"
import { PageApiTokensMcpSetup } from "./PageApiTokensMcpSetup"

const mcpServerEnvLabel = mcpEnvLabel(import.meta.env.VITE_APP_ENV)
const mcpServerOrigin = import.meta.env.VITE_APP_ORIGIN ?? "http://127.0.0.1:4000"

type TokenRow = {
  id: string
  name: string
  createdAt: Date
  lastUsedAt: Date | null
  revokedAt: Date | null
  createdBy: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
}

type Props = {
  tokens: TokenRow[]
}

function RevokeApiTokenButton({ tokenId, tokenName }: { tokenId: string; tokenName: string }) {
  const router = useRouter()
  const { mutate, isPending } = useMutation({
    mutationFn: () => revokeAdminApiTokenFn({ data: { id: tokenId } }),
    onSuccess: async () => {
      await router.invalidate()
    },
  })

  const handleClick = () => {
    if (
      !window.confirm(
        `Token „${tokenName}" unwiderruflich löschen? Bereits ausgestellte Konfigurationen mit diesem Token funktionieren danach nicht mehr.`,
      )
    ) {
      return
    }
    mutate()
  }

  return (
    <button
      type="button"
      className="text-sm text-red-700 underline hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending ? "Wird widerrufen…" : "Widerrufen"}
    </button>
  )
}

export function PageApiTokens({ tokens }: Props) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const createdMcpConfigJson = createdToken
    ? buildMcpCursorConfigJson({
        envLabel: mcpServerEnvLabel,
        origin: mcpServerOrigin,
        apiToken: createdToken,
      })
    : null

  const { mutate: createToken, isPending } = useMutation({
    mutationFn: (tokenName: string) => createAdminApiTokenFn({ data: { name: tokenName } }),
    onSuccess: async (result) => {
      setCreatedToken(result.token)
      setName("")
      setFormError(null)
      await router.invalidate()
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "Token konnte nicht erstellt werden")
    },
  })

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || isPending) return
    createToken(trimmed)
  }

  return (
    <>
      <AdminPageHeader title="API-Tokens (MCP)" />

      <div className={pageContentPaddingClassName}>
        <PageApiTokensMcpSetup envLabel={mcpServerEnvLabel} origin={mcpServerOrigin} />

        <form onSubmit={handleCreate} className="mb-4 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-gray-700">Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="z. B. mcp-laptop"
              className="block w-full min-w-48 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"
            />
          </label>
          <button type="submit" disabled={isPending} className={primaryButtonClassName}>
            {isPending ? "Wird erstellt…" : "Token erstellen"}
          </button>
        </form>

        {formError ? (
          <p className="mb-4 text-sm text-red-700">{translateServerError(formError)}</p>
        ) : null}

        {createdMcpConfigJson ? (
          <div className="mb-6 rounded-lg border border-green-300 bg-green-50 p-4 text-sm">
            <p className="mb-3 font-medium text-green-900">
              Neuer Token — fertige MCP-Konfiguration jetzt kopieren (wird nicht erneut angezeigt):
            </p>
            <McpCursorConfigPreview
              configJson={createdMcpConfigJson}
              copyLabel="MCP-Konfiguration kopieren"
              variant="success"
            />
          </div>
        ) : null}
      </div>

      <TableWrapper withTopBorder>
        <table className={adminTableClassName}>
          <thead>
            <tr className={adminTableHeadRowClassName}>
              <th className={adminTableHeaderClassName}>Name</th>
              <th className={adminTableHeaderClassName}>Erstellt von</th>
              <th className={adminTableHeaderClassName}>Erstellt</th>
              <th className={adminTableHeaderClassName}>Zuletzt genutzt</th>
              <th className={adminTableHeaderClassName}>Status</th>
              <th className={adminTableHeaderClassName} />
            </tr>
          </thead>
          <tbody className={adminTableBodyClassName}>
            {tokens.map((token) => (
              <tr key={token.id} className={adminTableRowClassName}>
                <th scope="row" className={adminTableCellClassName}>
                  {token.name}
                </th>
                <td className={adminTableCellClassName}>
                  {[token.createdBy.firstName, token.createdBy.lastName]
                    .filter(Boolean)
                    .join(" ") || token.createdBy.email}
                </td>
                <td className={adminTableCellClassName}>
                  {formatBerlinTime(token.createdAt, "dd.MM.yyyy, HH:mm")}
                </td>
                <td className={adminTableCellClassName}>
                  {token.lastUsedAt ? formatBerlinTime(token.lastUsedAt, "dd.MM.yyyy, HH:mm") : "—"}
                </td>
                <td className={adminTableCellClassName}>
                  {token.revokedAt ? (
                    <AdminBadge variant="red">Widerrufen</AdminBadge>
                  ) : (
                    <AdminBadge variant="green">Aktiv</AdminBadge>
                  )}
                </td>
                <td className={adminTableCellClassName}>
                  {token.revokedAt ? null : (
                    <RevokeApiTokenButton tokenId={token.id} tokenName={token.name} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </>
  )
}
