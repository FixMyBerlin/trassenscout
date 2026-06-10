import { SparklesIcon } from "@heroicons/react/20/solid"
import { ReactNode } from "react"
import { Link } from "@/src/components/core/components/links/Link"

const BannerShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="mb-6 flex w-full flex-col space-y-2 rounded-md border border-gray-200 bg-yellow-100 p-4 text-gray-700">
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
          to="/$projectSlug/project-records/$projectRecordId/edit"
          params={{
            projectSlug: props.projectSlug,
            projectRecordId: String(props.projectRecordId),
          }}
          className="text-sm"
        >
          Bearbeiten und bestätigen
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
