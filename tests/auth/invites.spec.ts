import type { Page } from "@playwright/test"
import { authFile, seedProjects, seedUsers } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { getTestDb } from "@/tests/_utils/testDb"
import { waitForFormReady } from "@/tests/_utils/waitForFormReady"

const projectSlug = seedProjects.richProject
const inviteEmail = seedUsers.noProject
const newInvitePath = `/${projectSlug}/invites/new`

type InviteFixture = {
  pendingToken: string
  pendingInviteId: number
  expiredToken: string
  expiredInviteId: number
}

function inviteStatusText(token: string | undefined, found: boolean) {
  return `Token: ${token ?? "NOT FOUND"} · Invite: ${found ? "FOUND" : "NOT FOUND"}`
}

async function expectInviteLoginStatus(page: Page, token: string | undefined, found: boolean) {
  await expect(page.getByText(inviteStatusText(token, found))).toBeVisible({ timeout: 30_000 })
}

async function gotoInviteLogin(page: Page, inviteToken?: string) {
  const path = inviteToken ? `/auth/login?inviteToken=${inviteToken}` : "/auth/login"
  await page.goto(path)
  await expect(page.getByRole("heading", { name: "In Account einloggen" })).toBeVisible({
    timeout: 30_000,
  })
}

async function cleanupInviteFixtures() {
  const db = await getTestDb()
  const project = await db.project.findFirstOrThrow({
    where: { slug: projectSlug },
    select: { id: true },
  })
  const invitee = await db.user.findUnique({
    where: { email: inviteEmail },
    select: { id: true },
  })

  await db.invite.deleteMany({
    where: {
      projectId: project.id,
      email: inviteEmail,
    },
  })

  if (invitee) {
    await db.membership.deleteMany({
      where: { projectId: project.id, userId: invitee.id },
    })
  }
}

test.describe.configure({ mode: "serial" })

test.describe("Invite flow", () => {
  test.use({ allowedConsoleErrors: pageNoise })

  let fixture: InviteFixture

  test.beforeAll(async () => {
    await cleanupInviteFixtures()

    const db = await getTestDb()
    const project = await db.project.findFirstOrThrow({
      where: { slug: projectSlug },
      select: { id: true },
    })
    const editor = await db.user.findFirstOrThrow({
      where: { email: seedUsers.editor },
      select: { id: true },
    })

    const pendingToken = `e2e-pending-${Date.now()}`
    const pendingInvite = await db.invite.create({
      data: {
        token: pendingToken,
        email: inviteEmail,
        status: "PENDING",
        role: "VIEWER",
        projectId: project.id,
        inviterId: editor.id,
      },
      select: { id: true },
    })

    const expiredToken = `e2e-expired-${Date.now()}`
    const expiredInvite = await db.invite.create({
      data: {
        token: expiredToken,
        email: `e2e-expired-${Date.now()}@fixmycity.test`,
        status: "EXPIRED",
        role: "VIEWER",
        projectId: project.id,
        inviterId: editor.id,
      },
      select: { id: true },
    })

    fixture = {
      pendingToken,
      pendingInviteId: pendingInvite.id,
      expiredToken,
      expiredInviteId: expiredInvite.id,
    }
  })

  test.afterAll(async () => {
    const db = await getTestDb()
    if (fixture?.pendingInviteId) {
      await db.invite.delete({ where: { id: fixture.pendingInviteId } }).catch(() => {})
    }
    if (fixture?.expiredInviteId) {
      await db.invite.delete({ where: { id: fixture.expiredInviteId } }).catch(() => {})
    }
    await cleanupInviteFixtures()
  })

  test.describe("editor invite access", () => {
    test.use({ storageState: authFile("editor") })

    test("can open the invite creation form", async ({ page }) => {
      await page.goto(newInvitePath)
      await expect(page.getByRole("heading", { name: "Teammitglied einladen" })).toBeVisible({
        timeout: 30_000,
      })
      await waitForFormReady(page, ["E-Mail-Adresse"])
      await expect(page.getByRole("button", { name: "Einladen", exact: true })).toBeVisible()
    })
  })

  test.describe("login inviteToken URL states", () => {
    test("without inviteToken shows NOT FOUND", async ({ page }) => {
      await gotoInviteLogin(page)
      await expectInviteLoginStatus(page, undefined, false)
    })

    test("with unknown inviteToken shows NOT FOUND", async ({ page }) => {
      await gotoInviteLogin(page, "e2e-invalid-invite-token")
      await expectInviteLoginStatus(page, "e2e-invalid-invite-token", false)
    })

    test("with pending inviteToken shows FOUND and locks invite email", async ({ page }) => {
      await gotoInviteLogin(page, fixture.pendingToken)
      await expectInviteLoginStatus(page, fixture.pendingToken, true)
      await expect(page.getByLabel("E-Mail-Adresse der Einladung")).toHaveValue(inviteEmail)
      await expect(page.getByLabel("E-Mail-Adresse der Einladung")).toHaveAttribute("readonly", "")
    })

    test("with expired inviteToken shows NOT FOUND", async ({ page }) => {
      await gotoInviteLogin(page, fixture.expiredToken)
      await expectInviteLoginStatus(page, fixture.expiredToken, false)
    })
  })

  test("invited user cannot accept with a different account", async ({ page }) => {
    await gotoInviteLogin(page, fixture.pendingToken)
    await expectInviteLoginStatus(page, fixture.pendingToken, true)

    await page.getByRole("button", { name: "all-projects-viewer", exact: true }).click()

    await expect(page.getByRole("alert")).toContainText("Die Einladung", { timeout: 30_000 })
    await expect(page).toHaveURL(new RegExp(`/auth/login\\?inviteToken=${fixture.pendingToken}`))

    const db = await getTestDb()
    const invite = await db.invite.findFirstOrThrow({
      where: { id: fixture.pendingInviteId },
      select: { status: true },
    })
    expect(invite.status).toBe("PENDING")
  })

  test("invited user accepts invite and lands on the project", async ({ page }) => {
    await gotoInviteLogin(page, fixture.pendingToken)
    await expectInviteLoginStatus(page, fixture.pendingToken, true)

    await page.getByRole("button", { name: "no-project", exact: true }).click()

    await expect(page).toHaveURL(new RegExp(`/${projectSlug}(\\?.*)?$`), { timeout: 30_000 })

    const db = await getTestDb()
    const invite = await db.invite.findFirstOrThrow({
      where: { id: fixture.pendingInviteId },
      select: { status: true },
    })
    expect(invite.status).toBe("ACCEPTED")

    const invitee = await db.user.findFirstOrThrow({
      where: { email: inviteEmail },
      select: { id: true },
    })
    const project = await db.project.findFirstOrThrow({
      where: { slug: projectSlug },
      select: { id: true },
    })
    const membership = await db.membership.findFirst({
      where: { projectId: project.id, userId: invitee.id },
    })
    expect(membership).not.toBeNull()
  })
})
