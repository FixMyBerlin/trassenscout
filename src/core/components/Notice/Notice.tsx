import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid"
import { clsx } from "clsx"

type TypeTypes = "info" | "error" | "warn" | "success"

type TypConfig = {
  [key in TypeTypes]: TypeConfigElement
}
type TypeConfigElement = {
  icon: React.ReactNode
  wrapperClass: string
  titleClasses: string
  textClasses: string
  actionClasses: string
}

const typeConfig: TypConfig = {
  error: {
    icon: <XCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />,
    wrapperClass: "bg-red-50 border-red-500",
    titleClasses: "text-red-800",
    textClasses: "text-red-800",
    actionClasses:
      "bg-red-50 focus:ring-red-500 focus:ring-offset-red-50 text-red-800 hover:bg-red-100",
  },
  info: {
    icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />,
    wrapperClass: "bg-blue-50 border-blue-500",
    titleClasses: "text-blue-800",
    textClasses: "text-blue-800",
    actionClasses:
      "bg-blue-50 focus:ring-blue-500 focus:ring-offset-blue-50 text-blue-800 hover:bg-blue-100",
  },
  warn: {
    icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-700" aria-hidden="true" />,
    wrapperClass: "bg-yellow-50 border-yellow-500",
    titleClasses: "text-yellow-800",
    textClasses: "text-yellow-700",
    actionClasses:
      "bg-yellow-50 focus:ring-yellow-600 focus:ring-offset-yellow-50 text-yellow-800 hover:bg-yellow-100",
  },
  success: {
    icon: <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />,
    wrapperClass: "bg-green-50 border-green-500",
    titleClasses: "text-green-800",
    textClasses: "text-green-700",
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

export const Notice: React.FC<Props> = ({ type, title, children, actionText, action }) => {
  if (!type) return null
  const { icon, wrapperClass, titleClasses, textClasses, actionClasses } = typeConfig[type]

  return (
    <div className={clsx(wrapperClass, "border-gray-200p-4 mb-5 rounded-md border")}>
      <div className="flex">
        <div className="shrink-0">{icon}</div>

        <div className="ml-3">
          <h3 className={clsx(titleClasses, "text-sm font-medium")}>{title}</h3>

          {children && (
            <div className={clsx(textClasses, "prose prose-sm mt-2 text-sm")}>{children}</div>
          )}

          {Boolean(action) && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex space-x-3">
                <button
                  type="button"
                  className={clsx(
                    actionClasses,
                    "rounded-md px-2 py-1.5 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-hidden",
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
