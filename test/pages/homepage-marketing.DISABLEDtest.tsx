/**
 * @vitest-environment jsdom
 */
import Homepage from "@/src/app/(marketing)/page"
import { CurrentUser } from "@/src/users/types"
import { expect, test, vi } from "vitest"
import { render } from "../utils"

// vi.mock("public/logo.png", () => ({
//   default: { src: "/logo.png" },
// }))

// Disabled for now, because Server components don't work in Vitest
// See https://nextjs.org/docs/app/building-your-application/testing#async-server-components
// See https://nextjs.org/docs/app/building-your-application/testing/vitest
// See https://github.com/testing-library/react-testing-library/issues/1209

test.skip("Homepage: Render Landingpage Text", () => {
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

  const { getByText } = render(<Homepage />)
  const linkElement = getByText(/Trassenscout findet Wege/i)
  expect(linkElement).toBeInTheDocument()
})
