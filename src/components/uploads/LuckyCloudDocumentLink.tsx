import { UserGroupIcon } from "@heroicons/react/24/outline"
import { Link } from "@/src/components/core/components/links/Link"

type Props = {
  collaborationUrl: string | null
}

export const LuckyCloudDocumentLink = ({ collaborationUrl }: Props) => {
  if (!collaborationUrl) return null

  return (
    <Link
      href={collaborationUrl}
      blank
      button
      icon={<UserGroupIcon className="size-5 text-yellow-400" />}
    >
      Dokument öffnen (Kollaboration)
    </Link>
  )
}
