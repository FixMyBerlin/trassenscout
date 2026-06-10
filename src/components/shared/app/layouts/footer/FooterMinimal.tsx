import { Link } from "@/src/components/core/components/links/Link"
import { authLinks, publicLinks } from "./links.const"

export const FooterMinimal = () => {
  const allLinks = [...publicLinks, ...authLinks]
  return (
    <footer className="mx-auto space-x-5 pb-8 text-center">
      {allLinks.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          blank={item.blank}
          className="text-sm text-gray-400 decoration-gray-400"
        >
          {item.name}
        </Link>
      ))}
    </footer>
  )
}
