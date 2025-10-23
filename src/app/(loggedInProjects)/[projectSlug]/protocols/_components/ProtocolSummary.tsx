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
}

export const ProtocolSummary = ({ protocol }: ProtocolSummaryProps) => {
  return (
    <div className="mt-7 space-y-4">
      <div>
        <span className="font-medium text-gray-500">am/bis: </span>
        <span>{format(new Date(protocol.date!), "P", { locale: de })}</span>
      </div>
      <div>
        <span className="font-medium text-gray-500">Titel: </span>
        <span>{protocol.title}</span>
      </div>
      <div>
        <span className="font-medium text-gray-500">Planungsabschnitt: </span>
        {protocol.subsection ? (
          <Link href={`/${protocol.project.slug}/abschnitte/${protocol.subsection.slug}`}>
            <SubsectionIcon label={shortTitle(protocol.subsection.slug)} />
          </Link>
        ) : (
          <span>Keine Angabe</span>
        )}
      </div>

      {protocol.body && (
        <div className="max-w-3xl rounded-md bg-purple-100 p-4">
          <Markdown
            className="prose-p:text-base prose-ol:leading-tight prose-ul:list-disc prose-ul:leading-tight"
            markdown={protocol.body}
          />
        </div>
      )}

      <div>
        <p className="mb-2 font-medium text-gray-500">Tags: </p>
        {!!protocol.protocolTopics.length ? (
          <ul className="list-inside list-none space-y-1">
            {protocol.protocolTopics.map((topic) => (
              <li className="whitespace-nowrap text-gray-700" key={topic.id}>
                <Link
                  href={createProtocolFilterUrl(protocol.project.slug, { searchterm: topic.title })}
                >
                  #{topic.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <span>Keine Tags zugeordnet</span>
        )}
      </div>

      <div>
        <p className="mb-2 font-medium text-gray-500">Verknüpfte Dokumente</p>
        {!!protocol.uploads?.length ? (
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
        ) : (
          <span>Keine Dokumente verknüpft</span>
        )}
      </div>
    </div>
  )
}
