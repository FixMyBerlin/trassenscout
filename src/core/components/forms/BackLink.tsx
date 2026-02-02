import { Link } from "@/src/core/components/links"
import { Route } from "next"

type Props = {
  href: Route
  text: string
}

export const BackLink = ({ href, text }: Props) => {
  return (
    <div className="mt-6">
      <Link icon="back" href={href}>
        {text}
      </Link>
    </div>
  )
}
