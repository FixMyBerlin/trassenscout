import { Link } from "@/src/core/components/links"
import { links } from "./links.const"

export const FooterMinimal: React.FC = () => {
  return (
    <footer className="mx-auto space-x-5 pb-8 text-center">
      {links.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          blank={item.blank}
          className="text-sm text-gray-400 decoration-gray-400"
        >
          {item.name}
        </Link>
      ))}
    </footer>
  )
}
