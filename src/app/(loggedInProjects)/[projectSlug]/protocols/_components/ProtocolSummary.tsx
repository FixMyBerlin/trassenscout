import { Link } from "@/src/core/components/links"
import { SubsectionIcon } from "@/src/core/components/Map/Icons"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { shortTitle } from "@/src/core/components/text"
import getProtocol from "@/src/server/protocols/queries/getProtocol"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { createProtocolFilterUrl } from "./createFilterUrl"

type ProtocolSummaryProps = {
  protocol: Awaited<ReturnType<typeof getProtocol>>
  projectSlug: string
}

export const ProtocolSummary = ({ protocol, projectSlug }: ProtocolSummaryProps) => {
  return (
    <div className="mt-7 space-y-4">
      <div>
        <span className="font-medium text-gray-500">am/bis: </span>
        <span className="text-gray-900">
          {format(new Date(protocol.date!), "P", { locale: de })}
        </span>
      </div>

      {protocol.subsection && (
        <div className="flex items-end gap-2">
          <span className="font-medium text-gray-500">Planungsabschnitt: </span>
          <Link href={`/${projectSlug}/abschnitte/${protocol.subsection.slug}`}>
            <SubsectionIcon label={shortTitle(protocol.subsection.slug)} />
          </Link>
        </div>
      )}

      {protocol.body && (
        <div className="max-w-3xl rounded-md bg-purple-100 p-4">
          <Markdown
            className="prose-p:text-base prose-ol:leading-tight prose-ul:list-disc prose-ul:leading-tight"
            markdown={protocol.body}
          />
        </div>
      )}

      {!!protocol.protocolTopics.length && (
        <div>
          <p className="mb-2 font-medium text-gray-500">Tags</p>
          <ul className="list-inside list-none space-y-1">
            {protocol.protocolTopics.map((topic) => (
              <li className="whitespace-nowrap text-gray-700" key={topic.id}>
                <Link href={createProtocolFilterUrl(projectSlug, { searchterm: topic.title })}>
                  #{topic.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!!protocol.uploads?.length && (
        <div>
          <p className="mb-2 font-medium text-gray-500">Verknüpfte Dokumente</p>
          <ul className="list-inside list-disc space-y-1">
            {protocol.uploads.map((upload) => (
              <li key={upload.id} className="text-gray-700">
                <a
                  href={upload.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {upload.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
