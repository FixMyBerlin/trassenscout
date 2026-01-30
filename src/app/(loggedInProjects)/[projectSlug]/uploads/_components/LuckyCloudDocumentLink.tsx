import { Link } from "@/src/core/components/links"
import { UserGroupIcon } from "@heroicons/react/24/outline"

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
