"use client"

import { Link } from "@/src/core/components/links"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/core/components/text"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { AdminProtocolWithRelations } from "@/src/server/protocols/queries/getAllProtocolsAdmin"
import { ProtocolReviewState } from "@prisma/client"
import clsx from "clsx"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export const ProtocolReviewStatePill = ({ state }: { state: ProtocolReviewState }) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
      {
        [ProtocolReviewState.NEEDSREVIEW]: "border-yellow-200 bg-yellow-100 text-yellow-800",
        [ProtocolReviewState.REVIEWED]: "border-green-200 bg-green-100 text-green-800",
        [ProtocolReviewState.REJECTED]: "border-red-200 bg-red-100 text-red-800",
        [ProtocolReviewState.APPROVED]: "border-gray-200 bg-gray-100 text-gray-800",
      }[state],
    )}
  >
    {state === ProtocolReviewState.NEEDSREVIEW && "Benötigt Review"}
    {state === ProtocolReviewState.REVIEWED && "Reviewed"}
    {state === ProtocolReviewState.REJECTED && "Abgelehnt"}
    {state === ProtocolReviewState.APPROVED && "Genehmigt (USER)"}
  </span>
)

export const AdminProtocolsTable = ({ protocols }: { protocols: AdminProtocolWithRelations[] }) => {
  const spaceClasses = "px-3 py-2"

  return (
    <>
      <TableWrapper className="mt-7">
        <div className="min-w-full divide-y divide-gray-300">
          <div className="bg-gray-50">
            <div className="grid grid-cols-6">
              <div
                className={clsx(
                  spaceClasses,
                  "text-left text-sm font-semibold uppercase text-gray-900",
                )}
              >
                ID
              </div>
              <div
                className={clsx(
                  spaceClasses,
                  "text-left text-sm font-semibold uppercase text-gray-900",
                )}
              >
                Datum
              </div>
              <div
                className={clsx(
                  spaceClasses,
                  "col-span-2 text-left text-sm font-semibold uppercase text-gray-900",
                )}
              >
                Titel
              </div>
              <div
                className={clsx(
                  spaceClasses,
                  "text-left text-sm font-semibold uppercase text-gray-900",
                )}
              >
                Projekt
              </div>
              <div
                className={clsx(
                  spaceClasses,
                  "text-left text-sm font-semibold uppercase text-gray-900",
                )}
              >
                Review
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 bg-white">
            {!!protocols.length ? (
              protocols.map((protocol) => (
                <div key={protocol.id} className="grid grid-cols-6">
                  <div className={clsx(spaceClasses, "text-sm text-gray-900")}>{protocol.id}</div>
                  <div className={clsx(spaceClasses, "text-sm text-gray-900")}>
                    {protocol.date ? format(new Date(protocol.date), "P", { locale: de }) : "—"}
                  </div>
                  <div
                    className={clsx(spaceClasses, "col-span-2 text-sm font-semibold text-blue-500")}
                  >
                    <Link href={`/admin/protocols/${protocol.id}/review`}>{protocol.title}</Link>
                  </div>
                  <div className={clsx(spaceClasses, "text-sm text-gray-900")}>
                    <Link href={`/${protocol.project.slug}/protocols`}>
                      {shortTitle(protocol.project.slug)}
                    </Link>
                  </div>
                  <div className={clsx(spaceClasses, "text-sm text-gray-900")}>
                    <div className="flex flex-col gap-1">
                      <ProtocolReviewStatePill state={protocol.reviewState} />
                      <Link
                        href={`/admin/protocols/${protocol.id}/review`}
                        className="text-blue-500 hover:underline"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <ZeroCase visible={protocols.length} name="Protokolle" />
            )}
          </div>
        </div>
      </TableWrapper>
    </>
  )
}
