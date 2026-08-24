import { FormDetailsSummary } from "@/src/components/core/components/forms/FormDetailsSummary"
import {
  formDetailsClassName,
  formDetailsPanelClassName,
  formDetailsStackClassName,
} from "@/src/components/core/components/forms/styles/formDetailsStyles"
import { Link } from "@/src/components/core/components/links/Link"
import { buildMcpCursorConfigJson, type McpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { McpCursorConfigPreview } from "./McpCursorConfigPreview"

const stepListClassName = "list-decimal space-y-2 pl-5"
const mcpOperationsListClassName = "list-disc space-y-1 pl-5"
const cursorMcpDocsUrl = "https://cursor.com/docs/context/mcp"
const mcpRemoteServersDocsUrl =
  "https://modelcontextprotocol.io/docs/develop/connect-remote-servers"

type PageApiTokensMcpSetupProps = {
  envLabel: McpEnvLabel
  origin: string
}

export function PageApiTokensMcpSetup({ envLabel, origin }: PageApiTokensMcpSetupProps) {
  const placeholderConfigJson = buildMcpCursorConfigJson({ envLabel, origin })
  const serverName = `trassenscout-admin--${envLabel}`

  return (
    <div className="mb-6 space-y-4 text-sm text-gray-600">
      <div className="space-y-2">
        <p>
          Bearer-Tokens autorisieren den Remote-MCP-Server unter <code>{origin}/mcp</code>. Der
          Token-Wert wird nur einmal beim Erstellen angezeigt. Ein aktiver Token erlaubt:
        </p>
        <ul className={mcpOperationsListClassName}>
          <li>
            Projektliste lesen (<code>projects_list</code>) — Slug, Titel, URLs, Zähler für
            Planungsabschnitte und Führungen
          </li>
          <li>
            Führungen (Maßnahmen) pro Projekt auflisten (<code>fuehrungen_list</code>) — Slugs und
            URLs nach Planungsabschnitt
          </li>
        </ul>
        <p>Bei Verlust oder Ende der Nutzung widerrufen.</p>
      </div>

      <div className={formDetailsStackClassName}>
        <details className={formDetailsClassName}>
          <FormDetailsSummary>MCP einrichten (Cursor, Claude &amp; Co.)</FormDetailsSummary>
          <div className={formDetailsPanelClassName}>
            <section className="space-y-2 text-gray-700">
              <p>
                Der MCP-Server ist der HTTP-Endpunkt <code>{origin}/mcp</code> der laufenden App.
                Cursor und andere MCP-Clients verbinden sich per URL; die Authentifizierung erfolgt
                über den Bearer-Token im Header. Der Eintrag heißt <code>{serverName}</code> (
                <strong>{envLabel}</strong>
                -Umgebung), damit du DEV/STG/PRD parallel registrieren und auseinanderhalten kannst.
              </p>
            </section>

            <section className="space-y-2 text-gray-700">
              <h3 className="font-semibold text-gray-900">Cursor</h3>
              <ol className={stepListClassName}>
                <li>
                  Unten einen Token erstellen — die fertige Konfiguration mit echtem Token erscheint
                  dann direkt darüber (wird nicht erneut angezeigt).
                </li>
                <li>
                  <strong>MCP-Einstellungen öffnen:</strong> Befehlsleiste (<kbd>Cmd+Shift+P</kbd> /{" "}
                  <kbd>Ctrl+Shift+P</kbd>), <code>mcp</code> eingeben,{" "}
                  <strong>View: Open MCP Settings</strong> wählen. Konfiguration global in{" "}
                  <code>~/.cursor/mcp.json</code> oder projektbezogen in{" "}
                  <code>.cursor/mcp.json</code> — Details in der{" "}
                  <Link blank href={cursorMcpDocsUrl}>
                    Cursor MCP-Dokumentation
                  </Link>
                  .
                </li>
                <li>
                  Den <code>mcpServers</code>-Block aus dem Beispiel unten (bzw. die fertige
                  Variante mit echtem Token oben) übernehmen.
                </li>
                <li>MCP-Server neu laden bzw. Cursor neu starten.</li>
                <li>
                  Im Chat z. B. „Welche Projekte gibt es?“ oder „Führungen in rs23?“ fragen — Cursor
                  ruft Tools wie <code>projects_list</code> / <code>fuehrungen_list</code> auf. Mit{" "}
                  <code>env_info</code> prüfen, auf welche Umgebung der Server zeigt.
                </li>
              </ol>
            </section>

            <section className="space-y-2 text-gray-700">
              <h3 className="font-semibold text-gray-900">Mehrere Umgebungen (DEV/STG/PRD)</h3>
              <p>
                Pro Umgebung gibt es eine eigene Admin-Seite und damit eine eigene Konfiguration (
                <code>trassenscout-admin--DEV</code>, <code>--STG</code>, <code>--PRD</code>). Alle
                drei <code>mcpServers</code>-Einträge nebeneinander einfügen und je nach Aufgabe den
                passenden Server wählen; <code>env_info</code> bzw. der Servername zeigt die
                Umgebung.
              </p>
            </section>

            <section className="space-y-2 text-gray-700">
              <h3 className="font-semibold text-gray-900">Claude &amp; andere MCP-Clients</h3>
              <p>
                Clients mit Remote-MCP (HTTP) nutzen dieselbe <code>mcpServers</code>-Struktur mit{" "}
                <code>url</code> + <code>headers</code> wie im Beispiel — nur Speicherort und UI
                unterscheiden sich. Anleitung:{" "}
                <Link blank href={mcpRemoteServersDocsUrl}>
                  MCP: Connect to remote servers
                </Link>
                .
              </p>
            </section>

            <section className="space-y-2 text-gray-700">
              <h3 className="font-semibold text-gray-900">Beispiel-Konfiguration ({envLabel})</h3>
              <p>
                Platzhalter-Token — nach dem Erstellen eines Tokens oben die fertige Variante mit
                echtem Wert kopieren.
              </p>
              <McpCursorConfigPreview configJson={placeholderConfigJson} />
            </section>
          </div>
        </details>
      </div>
    </div>
  )
}
