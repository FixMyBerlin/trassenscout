"use client"

import { Link } from "@/src/core/components/links"
import { projectRecordEditRoute } from "@/src/core/routes/projectRecordRoutes"
import { SparklesIcon } from "@heroicons/react/20/solid"
import { ReactNode } from "react"

const BannerShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="mb-6 inline-flex flex-col space-y-2 rounded-md border border-gray-200 bg-yellow-100 p-4 text-gray-700">
      {children}
    </div>
  )
}

type ProjectRecordNeedsReviewBannerProps =
  | {
      withAction: true
      projectSlug: string
      projectRecordId: number
    }
  | {
      withAction?: false
      projectSlug?: string
      projectRecordId?: number
    }

export const ProjectRecordNeedsReviewBanner = (props: ProjectRecordNeedsReviewBannerProps) => {
  return (
    <BannerShell>
      <div className="flex items-center gap-2">
        <SparklesIcon className="size-5" />
        <h3 className="font-semibold">Bestätigung erforderlich</h3>
      </div>
      <p className="text-sm">
        Dieser Protokolleintrag wurde per KI erstellt und muss noch bestätigt werden.
      </p>
      {props.withAction && (
        <Link
          href={projectRecordEditRoute(props.projectSlug, props.projectRecordId)}
          className="text-sm"
        >
          Zur Bestätigung
        </Link>
      )}
    </BannerShell>
  )
}

export const ProjectRecordsNeedsReviewInfoBanner = () => {
  return (
    <BannerShell>
      <div className="flex items-center gap-2">
        <SparklesIcon className="size-5" />
        <h3 className="font-semibold">Bestätigung erforderlich</h3>
      </div>
      <p className="text-sm">
        Diese Protokolleinträge wurde per KI-Assistent erstellt und müssen noch freigegeben werden.
        <br />
        Alle unbestätigten Protkolleinträge sind für Nutzer mit Leserechten nicht sichtbar.
      </p>
    </BannerShell>
  )
}
