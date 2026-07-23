import { SparklesIcon } from "@heroicons/react/20/solid"
import { ReactNode } from "react"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"

const BannerShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full border-b border-gray-200 bg-yellow-100 text-gray-700">
      <div className={twJoin(pageContentPaddingClassName, "flex flex-col space-y-2")}>
        {children}
      </div>
    </div>
  )
}

type ProjectRecordNeedsReviewBannerProps = {
  withAction?: boolean
  projectSlug?: string
  projectRecordId?: number
  editHref?: string
}

export const ProjectRecordNeedsReviewBanner = ({
  withAction,
  projectSlug,
  projectRecordId,
  editHref,
}: ProjectRecordNeedsReviewBannerProps) => {
  return (
    <BannerShell>
      <div className="flex items-center gap-2">
        <SparklesIcon className="size-5" />
        <h3 className="font-semibold">Bestätigung erforderlich</h3>
      </div>
      <p className="text-sm">
        Dieser Protokolleintrag wurde per KI erstellt und muss noch bestätigt werden.
      </p>
      {withAction &&
        (editHref ? (
          <Link href={editHref} className="text-sm">
            Bearbeiten und bestätigen
          </Link>
        ) : projectSlug && projectRecordId !== undefined ? (
          <Link
            to="/$projectSlug/project-records/$projectRecordId/edit"
            params={{
              projectSlug,
              projectRecordId: String(projectRecordId),
            }}
            className="text-sm"
            resetScroll={false}
          >
            Bearbeiten und bestätigen
          </Link>
        ) : null)}
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
