/**
 * @vitest-environment jsdom
 */
import Home from "@/src/pages"
import { expect, test, vi } from "vitest"
import { mockProject } from "../mocks/mockProject"
import { mockCurrentUser } from "../mocks/mockUser"
import { render } from "../utils"

// vi.mock("public/logo.png", () => ({
//   default: { src: "/logo.png" },
// }))

test.skip("Homepage: Render Dashboard", () => {
  vi.mock("src/users/hooks/useCurrentUser", () => ({
    useCurrentUser: () => mockCurrentUser,
  }))

  vi.mock("src/projects/queries/getProjects", () => ({
    getProjects: async () => ({ projects: [mockProject, mockProject, mockProject] }),
  }))

  vi.mock("next/router", () => require("next-router-mock"))

  const { getByText } = render(<Home user={mockCurrentUser} />)
  const linkElement = getByText(/Trassenscout findet Wege/i)
  expect(linkElement).toBeInTheDocument()
})
