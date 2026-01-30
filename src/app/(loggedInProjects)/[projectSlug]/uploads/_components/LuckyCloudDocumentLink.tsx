import { blueButtonStylesForLinkElement } from "@/src/core/components/links"
import { clsx } from "clsx"
import { UserGroupIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

type Props = {
  collaborationUrl: string | null
}

export const LuckyCloudDocumentLink = ({ collaborationUrl }: Props) => {
  if (!collaborationUrl) return null

  return (
    <Link
      href={collaborationUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(blueButtonStylesForLinkElement, "inline-flex items-center gap-2")}
    >
      <UserGroupIcon className="size-5 text-yellow-400" />
      Dokument öffnen (Kollaboration)
    </Link>
  )
}
