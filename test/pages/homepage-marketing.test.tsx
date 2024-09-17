/**
 * @vitest-environment jsdom
 */
import Home from "@/src/pages"
import { CurrentUser } from "@/src/users/types"
import { expect, test, vi } from "vitest"
import { render } from "../utils"

// vi.mock("public/logo.png", () => ({
//   default: { src: "/logo.png" },
// }))

test("Homepage: Render Landingpage Text", () => {
  const currentUser = null satisfies CurrentUser | null
  // const currentUser = {
  //   id: 1,
  //   firstName: "Test User Firstname",
  //   lastName: "Test User Lastname",
  //   email: "user@email.com",
  //   phone: null,
  //   role: "USER",
  //   institution: null,
  // } satisfies CurrentUser

  vi.mock("src/users/hooks/useCurrentUser", () => ({
    useCurrentUser: () => currentUser,
  }))

  vi.mock("next/router", () => require("next-router-mock"))

  const { getByText } = render(<Home user={currentUser} />)
  const linkElement = getByText(/Trassenscout findet Wege/i)
  expect(linkElement).toBeInTheDocument()
})
