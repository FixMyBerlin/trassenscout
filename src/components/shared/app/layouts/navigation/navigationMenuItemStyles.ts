import { twJoin } from "tailwind-merge"

export const navigationMenuItemLinkStyles = (focus: boolean) =>
  twJoin(
    focus ? "bg-gray-100" : "",
    "block rounded-md px-3 py-2 text-sm text-gray-700 no-underline hover:bg-gray-100 hover:text-blue-500",
  )

export const navigationMenuTransitionProps = {
  enter: "transition ease-out duration-100",
  enterFrom: "transform opacity-0 scale-95",
  enterTo: "transform opacity-100 scale-100",
  leave: "transition ease-in duration-75",
  leaveFrom: "transform opacity-100 scale-100",
  leaveTo: "transform opacity-0 scale-95",
}
