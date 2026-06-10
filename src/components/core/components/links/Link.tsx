import { MagnifyingGlassPlusIcon } from "@heroicons/react/16/solid"
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ListBulletIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/20/solid"
import { ArrowTopRightOnSquareIcon, PencilIcon, UserGroupIcon } from "@heroicons/react/24/outline"
import { Link as RouterLink, type LinkComponentProps } from "@tanstack/react-router"
import { cloneElement, isValidElement } from "react"
import { twMerge } from "tailwind-merge"
import { compactButtonIconClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { selectLinkStyle } from "./styles"

type CoreLinkStyleProps = {
  className?: string
  classNameOverwrites?: string
  /** @default `false` */
  blank?: boolean
  /** @desc Style Link as Button */
  button?: true | "blue" | "white" | "pink"
  icon?: keyof typeof linkIcons | React.ReactNode
  children: React.ReactNode
}

type RouterLinkBehaviorProps = Pick<
  LinkComponentProps<"a">,
  | "params"
  | "search"
  | "hash"
  | "state"
  | "replace"
  | "preload"
  | "preloadDelay"
  | "resetScroll"
  | "activeOptions"
  | "activeProps"
  | "inactiveProps"
  | "disabled"
  | "reloadDocument"
  | "viewTransition"
  | "startTransition"
  | "ignoreBlocker"
  | "mask"
  | "from"
>

type ExternalLinkProps = CoreLinkStyleProps & {
  href: string
  to?: never
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">

/** App navigation via TanStack Router — `to` accepts resolved paths including search strings. */
type InternalLinkProps = CoreLinkStyleProps &
  RouterLinkBehaviorProps & {
    href?: never
    to: string
  } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">

export type LinkProps = ExternalLinkProps | InternalLinkProps

export const linkIcons = {
  back: <ArrowLeftIcon className="size-3.5" />,
  plus: <PlusIcon className="size-3.5" />,
  edit: <PencilIcon className="size-3.5" />,
  download: <ArrowDownTrayIcon className="size-3.5" />,
  delete: <TrashIcon className="size-3.5" />,
  list: <ListBulletIcon className="size-3.5" />,
  details: <MagnifyingGlassPlusIcon className="size-4" />,
  action: <ArrowTopRightOnSquareIcon className="size-3.5" />,
  collaboration: <UserGroupIcon className="-ml-0.5 size-5" />,
}

export const isExternalHref = (href: string) =>
  !href.startsWith("/") || href.startsWith("//") || href.startsWith("/api/")

function useLinkPresentation({
  className,
  classNameOverwrites,
  button,
  icon,
}: Pick<CoreLinkStyleProps, "className" | "classNameOverwrites" | "button" | "icon">) {
  const rawIconElement =
    icon && typeof icon === "string" && icon in linkIcons
      ? linkIcons[icon as keyof typeof linkIcons]
      : icon
        ? (icon as React.ReactNode)
        : null

  const classNames = twMerge(classNameOverwrites ?? selectLinkStyle(button, className))

  const iconElement =
    rawIconElement && button && isValidElement<{ className?: string }>(rawIconElement)
      ? cloneElement(rawIconElement, {
          className: twMerge(compactButtonIconClassName, rawIconElement.props.className),
        })
      : rawIconElement

  return { classNames, iconElement }
}

function renderLinkContent(
  iconElement: React.ReactNode | null,
  children: React.ReactNode,
  button: CoreLinkStyleProps["button"],
) {
  if (!iconElement) return children

  const iconAndText = (
    <>
      <span className="inline-block shrink-0 align-middle">{iconElement}</span>
      {"\u00A0"}
      {children}
    </>
  )

  // Button links are inline-flex with gap — wrap so icon+text stay one unit (nbsp glue).
  return button ? <span className="inline-flex items-center">{iconAndText}</span> : iconAndText
}

export function Link(props: LinkProps) {
  const { className, classNameOverwrites, children, blank = false, button, icon, ...rest } = props

  const { classNames, iconElement } = useLinkPresentation({
    className,
    classNameOverwrites,
    button,
    icon,
  })

  if ("href" in props && props.href !== undefined) {
    const { href, ...anchorProps } = rest as Omit<ExternalLinkProps, keyof CoreLinkStyleProps>

    return (
      <a
        href={href}
        className={classNames}
        rel={blank || isExternalHref(href) ? "noopener noreferrer" : undefined}
        target={blank ? "_blank" : undefined}
        {...anchorProps}
      >
        {renderLinkContent(iconElement, children, button)}
      </a>
    )
  }

  const { to, ...routerProps } = rest as Omit<InternalLinkProps, keyof CoreLinkStyleProps>

  return (
    <RouterLink
      to={to as LinkComponentProps<"a">["to"]}
      className={classNames}
      target={blank ? "_blank" : undefined}
      {...routerProps}
    >
      {renderLinkContent(iconElement, children, button)}
    </RouterLink>
  )
}
