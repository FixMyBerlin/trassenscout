import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid"

import { CheckCircleIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"

type TypeTypes = "info" | "error" | "warn" | "success"

type TypConfig = {
  [key in TypeTypes]: TypeConfigElement
}
type TypeConfigElement = {
  icon: React.ReactNode
  bgClasses: string
  titleClasses: string
  textClasses: string
  actionClasses: string
}

const typeConfig: TypConfig = {
  error: {
    icon: <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />,
    bgClasses: "bg-red-50",
    titleClasses: "bg-red-800",
    textClasses: "bg-red-700",
    actionClasses:
      "bg-red-50 focus:ring-red-600 focus:ring-offset-red-50 text-red-800 hover:bg-red-100",
  },
  info: {
    icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />,
    bgClasses: "bg-blue-50",
    titleClasses: "bg-blue-800",
    textClasses: "bg-blue-700",
    actionClasses:
      "bg-blue-50 focus:ring-blue-600 focus:ring-offset-blue-50 text-blue-800 hover:bg-blue-100",
  },
  warn: {
    icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />,
    bgClasses: "bg-yellow-50",
    titleClasses: "bg-yellow-800",
    textClasses: "bg-yellow-700",
    actionClasses:
      "bg-yellow-50 focus:ring-yellow-600 focus:ring-offset-yellow-50 text-yellow-800 hover:bg-yellow-100",
  },
  success: {
    icon: <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />,
    bgClasses: "bg-green-50",
    titleClasses: "bg-green-800",
    textClasses: "bg-green-700",
    actionClasses:
      "bg-green-50 focus:ring-green-600 focus:ring-offset-green-50 text-green-800 hover:bg-green-100",
  },
}

type Props = {
  type: TypeTypes
  title: string
  children?: React.ReactNode
  actionText?: string
  action?: (_: any) => void
}

export const info: React.FC<Props> = ({ type, title, children, actionText, action }) => {
  if (!type) return null
  const { icon, bgClasses, titleClasses, textClasses, actionClasses } = typeConfig[type]

  return (
    <div className={clsx(bgClasses, "rounded-md p-4")}>
      <div className="flex">
        <div className="flex-shrink-0">{icon}</div>

        <div className="ml-3">
          <h3 className={clsx(titleClasses, "text-sm font-medium")}>{title}</h3>

          {children && (
            <div className={clsx(textClasses, "mt-2 text-sm prose prose-sm")}>{children}</div>
          )}

          {Boolean(action) && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex space-x-3">
                <button
                  type="button"
                  className={clsx(
                    actionClasses,
                    "rounded-md px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2  focus:ring-offset-2"
                  )}
                  onClick={action}
                >
                  {actionText}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
