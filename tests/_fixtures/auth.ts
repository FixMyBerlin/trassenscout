import path from "path"

export const seedPassword = "dev-team@fixmycity.de"

export const seedUsers = {
  admin: "admin@fixmycity.test",
  viewer: "all-projects-viewer@fixmycity.test",
  editor: "all-projects-editor@fixmycity.test",
  noProject: "no-project@fixmycity.test",
} as const

export const seedUserButtons = {
  admin: "admin",
  viewer: "all-projects-viewer",
  editor: "all-projects-editor",
  noProject: "no-project",
} as const

export const seedProjects = {
  richProject: "rs23",
  forbiddenProject: "rs0v1",
  secondaryForbiddenProject: "rs0v2",
} as const

export const authFile = (role: keyof typeof seedUsers) =>
  path.resolve(__dirname, "..", ".auth", `${role}.json`)
