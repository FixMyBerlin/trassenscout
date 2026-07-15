import { Link } from "@/src/components/core/components/links/Link"
import { FooterBuildByLine } from "./FooterBuildByLine"

export const FooterBuildByLineAndFeedback = () => {
  return (
    <div className="mt-8 border-t border-gray-400 pt-8 md:flex md:items-center md:justify-between">
      <FooterBuildByLine className="text-sm text-gray-400 md:mt-0" />
      <p className="text-sm text-gray-400">
        Fragen oder Feedback? Schreiben Sie uns:{" "}
        <Link classNameOverwrites="gray-400 underline" href="mailto:feedback@fixmycity.de">
          feedback@fixmycity.de
        </Link>
      </p>
    </div>
  )
}
