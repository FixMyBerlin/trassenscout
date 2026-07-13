import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"

const navAuthButtonBase =
  "w-full font-medium sm:w-auto shadow-xs text-sm rounded-lg inline-flex items-center justify-center no-underline px-3 py-2"

/** Auth CTAs on `NavigationWrapper` (`bg-gray-800`) — lighter hovers so buttons stay visible on the bar. */
const signupButtonOnDarkNav = twJoin(
  navAuthButtonBase,
  "bg-white text-gray-800 shadow-sm ring-1 ring-white/80 transition-colors",
  "hover:bg-gray-200 hover:text-gray-900 hover:shadow-md hover:ring-2 hover:ring-white",
  "active:bg-white active:ring-2 active:ring-white/60",
)

const loginButtonOnDarkNav = twJoin(
  navAuthButtonBase,
  "bg-blue-500 text-white",
  "hover:bg-blue-400 hover:text-white",
  "active:ring-2 active:ring-blue-300",
)

export const NavigationUserLoggedOut = () => {
  return (
    <div className="sm:ml-6">
      <div className="flex items-center gap-2">
        <Link classNameOverwrites={signupButtonOnDarkNav} to="/auth/signup">
          Registrieren
        </Link>
        <Link classNameOverwrites={loginButtonOnDarkNav} to="/auth/login">
          Anmelden
        </Link>
      </div>
    </div>
  )
}
