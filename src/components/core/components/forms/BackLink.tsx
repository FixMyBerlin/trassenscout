import { Link } from "@/src/components/core/components/links/Link"

type Props = {
  text: string
  to: string
  params?: Record<string, string>
  search?: Record<string, string | undefined>
}

export const BackLink = ({ text, to, params, search }: Props) => {
  return (
    <Link icon="back" to={to} params={params} search={search}>
      {text}
    </Link>
  )
}
