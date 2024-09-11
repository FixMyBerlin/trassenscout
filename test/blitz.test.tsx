/**
 * @vitest-environment jsdom
 */
import { render } from "test/utils"
import { expect, test, vi } from "vitest"
import Blitz from "../src/pages/blitz"

vi.mock("public/logo.png", () => ({
  default: { src: "/logo.png" },
}))

test.skip("renders blitz documentation link", () => {
  // This is an example of how to ensure a specific item is in the document
  // But it's disabled by default (by test.skip) so the test doesn't fail
  // when you remove the the default content from the page

  // This is an example on how to mock api hooks when testing
  vi.mock("src/users/hooks/useCurrentUser", () => ({
    useCurrentUser: () => ({
      id: 1,
      name: "User",
      email: "user@email.com",
      role: "user",
    }),
  }))

  const { getByText } = render(<Blitz />)
  const linkElement = getByText(/Documentation/i)
  expect(linkElement).toBeInTheDocument()
})
