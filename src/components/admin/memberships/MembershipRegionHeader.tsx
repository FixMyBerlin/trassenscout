import { membershipRegionHeaderClassName } from "@/src/components/admin/memberships/membershipRegionClasses"
import { longTitle, shortTitle } from "@/src/components/core/components/text/titles"

type Props = {
  slug: string
}

export function MembershipRegionHeader({ slug }: Props) {
  return (
    <th scope="col" title={longTitle(slug)} className={membershipRegionHeaderClassName}>
      <span className="flex h-full items-end justify-center overflow-hidden">
        <span className="inline-block max-h-[calc(130px-1rem)] rotate-180 overflow-hidden text-ellipsis whitespace-nowrap [writing-mode:vertical-rl]">
          {shortTitle(slug)}
        </span>
      </span>
    </th>
  )
}
