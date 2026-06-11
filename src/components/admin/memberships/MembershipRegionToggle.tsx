import { twMerge } from "tailwind-merge"
import type { MembershipAccess } from "@/src/components/admin/memberships/membershipAccessUtils"
import {
  membershipRegionToggleOptions,
  type MembershipRegionToggleOption,
} from "@/src/components/admin/memberships/membershipRegionDisplay"

type Props = {
  value: MembershipAccess
  onChange: (value: MembershipRegionToggleOption["value"]) => void
  disabled?: boolean
}

export function MembershipRegionToggle({ value, onChange, disabled }: Props) {
  return (
    <span className="isolate inline-flex rounded-md shadow-xs">
      {membershipRegionToggleOptions.map((option, index) => {
        const { Icon, label } = option
        const isActive = value === option.value

        return (
          <button
            key={label}
            type="button"
            disabled={disabled}
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={twMerge(
              "relative inline-flex cursor-pointer items-center justify-center bg-white px-1.5 py-1.5 text-xs font-semibold text-gray-900 inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 focus:z-10 disabled:cursor-not-allowed disabled:opacity-50",
              isActive ? "bg-blue-600 text-white inset-ring-blue-600 hover:bg-blue-700" : "",
              index === 0 ? "rounded-l-md" : "",
              index === membershipRegionToggleOptions.length - 1 ? "rounded-r-md" : "",
              index > 0 ? "-ml-px" : "",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
          </button>
        )
      })}
    </span>
  )
}
