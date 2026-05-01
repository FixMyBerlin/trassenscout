"use client"

import { EmailTemplatePreviewResult } from "@/src/server/emailTemplates/types"

type Props = {
  preview: EmailTemplatePreviewResult | null
  allowedVariables: string[]
  sampleContext: Record<string, string>
}

export const EmailTemplatePreviewPanel = ({
  preview,
  allowedVariables,
  sampleContext,
}: Props) => {
  return (
    <aside className="space-y-4 rounded-lg border border-gray-200 p-4">
      <div>
        <h2 className="font-semibold">Allowed Variables</h2>
        <ul className="mt-2 text-sm text-gray-700">
          {allowedVariables.length > 0 ? (
            allowedVariables.map((variable) => <li key={variable}>{`{{${variable}}}`}</li>)
          ) : (
            <li>Keine Variablen</li>
          )}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold">Sample Context</h2>
        <pre className="mt-2 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900">
          {JSON.stringify(sampleContext, null, 2)}
        </pre>
      </div>

      {preview && (
        <>
          <div>
            <h2 className="font-semibold">Preview Status</h2>
            <p className="mt-2 text-sm">
              Validierung: {preview.isValid ? "OK" : "Fehler gefunden"}
            </p>
            {preview.unknownVariables.length > 0 && (
              <ul className="mt-2 text-sm text-red-700">
                {preview.unknownVariables.map((variable) => (
                  <li key={variable}>{`{{${variable}}}`}</li>
                ))}
              </ul>
            )}
            {preview.htmlFields.length > 0 && (
              <ul className="mt-2 text-sm text-red-700">
                {preview.htmlFields.map((field) => (
                  <li key={field}>{`Raw HTML ist nicht erlaubt in: ${field}`}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="font-semibold">Rendered Subject</h2>
            <p className="mt-2 rounded bg-gray-50 p-3 text-sm">{preview.rendered.subject}</p>
          </div>

          <div>
            <h2 className="font-semibold">HTML Preview</h2>
            <iframe
              title="Email Preview"
              className="mt-2 h-96 w-full rounded border border-gray-200 bg-white"
              srcDoc={preview.html}
            />
          </div>
        </>
      )}
    </aside>
  )
}
