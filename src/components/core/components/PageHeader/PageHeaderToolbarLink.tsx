import { ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import { twJoin } from "tailwind-merge"
import {
  compactPaddingIcon,
  compactPaddingSm,
} from "@/src/components/core/components/buttons/buttonStyles"
import { isExternalHref } from "@/src/components/core/components/links/Link"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"

type Props = {
  href: string
  /** Full label used for tooltip and aria-label */
  label: string
  /** Visible button text next to the icon; omit for icon-only */
  children?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

const buttonClassName =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-500 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"

/** Compact header action link, sized to match `PageHeaderViewSwitch`. */
export function PageHeaderToolbarLink({
  href,
  label,
  children,
  icon = <ArrowDownTrayIcon className="size-5 shrink-0" aria-hidden="true" />,
  className,
}: Props) {
  return (
    <Tooltip content={label} variant="light" placement="top-start">
      <a
        href={href}
        className={twJoin(
          buttonClassName,
          children ? compactPaddingSm : compactPaddingIcon,
          className,
        )}
        aria-label={label}
        rel={isExternalHref(href) ? "noopener noreferrer" : undefined}
      >
        {icon}
        {children ? <span>{children}</span> : null}
      </a>
    </Tooltip>
  )
}
