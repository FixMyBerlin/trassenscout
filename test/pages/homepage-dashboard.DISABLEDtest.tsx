/**
 * @vitest-environment jsdom
 */
import DashboardPage from "@/src/app/(loggedin)/dashboard/page"
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

  const { getByText } = render(<DashboardPage />)
  const linkElement = getByText(/Trassenscout findet Wege/i)
  expect(linkElement).toBeInTheDocument()
})
