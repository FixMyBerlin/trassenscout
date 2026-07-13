import type { Page } from "@playwright/test"
import { DEV_LOGIN_PASSWORD } from "@/src/components/pages/auth/loginDevQuickLogin.const"
import { authFile, seedProjects, seedUsers } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { getTestDb } from "@/tests/_utils/testDb"
import { waitForFormReady } from "@/tests/_utils/waitForFormReady"

const projectSlug = seedProjects.richProject
const loggedInProjectSlug = seedProjects.forbiddenProject
const formLoginProjectSlug = seedProjects.secondaryForbiddenProject
const inviteEmail = seedUsers.noProject
const newInvitePath = `/${projectSlug}/invites/new`

type InviteFixture = {
  pendingToken: string
  pendingInviteId: number
  loggedInToken: string
  loggedInInviteId: number
  formLoginToken: string
  formLoginInviteId: number
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
  const projects = await db.project.findMany({
    where: { slug: { in: [projectSlug, loggedInProjectSlug, formLoginProjectSlug] } },
    select: { id: true },
  })
  const projectIds = projects.map((project) => project.id)
  const invitee = await db.user.findUnique({
    where: { email: inviteEmail },
    select: { id: true },
  })

  await db.invite.deleteMany({
    where: {
      projectId: { in: projectIds },
      email: inviteEmail,
    },
  })

  if (invitee) {
    await db.membership.deleteMany({
      where: { projectId: { in: projectIds }, userId: invitee.id },
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

    const loggedInProject = await db.project.findFirstOrThrow({
      where: { slug: loggedInProjectSlug },
      select: { id: true },
    })
    const loggedInToken = `e2e-logged-in-${Date.now()}`
    const loggedInInvite = await db.invite.create({
      data: {
        token: loggedInToken,
        email: inviteEmail,
        status: "PENDING",
        role: "VIEWER",
        projectId: loggedInProject.id,
        inviterId: editor.id,
      },
      select: { id: true },
    })

    const formLoginProject = await db.project.findFirstOrThrow({
      where: { slug: formLoginProjectSlug },
      select: { id: true },
    })
    const formLoginToken = `e2e-form-login-${Date.now()}`
    const formLoginInvite = await db.invite.create({
      data: {
        token: formLoginToken,
        email: inviteEmail,
        status: "PENDING",
        role: "VIEWER",
        projectId: formLoginProject.id,
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
      loggedInToken,
      loggedInInviteId: loggedInInvite.id,
      formLoginToken,
      formLoginInviteId: formLoginInvite.id,
      expiredToken,
      expiredInviteId: expiredInvite.id,
    }
  })

  test.afterAll(async () => {
    const db = await getTestDb()
    if (fixture?.pendingInviteId) {
      await db.invite.delete({ where: { id: fixture.pendingInviteId } }).catch(() => {})
    }
    if (fixture?.loggedInInviteId) {
      await db.invite.delete({ where: { id: fixture.loggedInInviteId } }).catch(() => {})
    }
    if (fixture?.formLoginInviteId) {
      await db.invite.delete({ where: { id: fixture.formLoginInviteId } }).catch(() => {})
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

  test("registered user accepts invite by logging in through the form with the mail link", async ({
    page,
  }) => {
    // The exact flow from the bug report: existing account, clicks the
    // "melden Sie sich bitte damit an" mail link and logs in via the form.
    await gotoInviteLogin(page, fixture.formLoginToken)
    await expectInviteLoginStatus(page, fixture.formLoginToken, true)
    await expect(page.getByLabel("E-Mail-Adresse der Einladung")).toHaveValue(inviteEmail)

    const passwordField = page.getByLabel("Passwort", { exact: true })
    await expect(passwordField).toBeEnabled({ timeout: 30_000 })
    // fill("") first: SSR-rendered inputs can swallow the first fill before hydration
    await passwordField.fill("")
    await passwordField.fill(DEV_LOGIN_PASSWORD)
    await page.getByRole("button", { name: "Anmelden", exact: true }).click()

    await expect(page).toHaveURL(new RegExp(`/${formLoginProjectSlug}(\\?.*)?$`), {
      timeout: 30_000,
    })

    const db = await getTestDb()
    const invite = await db.invite.findFirstOrThrow({
      where: { id: fixture.formLoginInviteId },
      select: { status: true },
    })
    expect(invite.status).toBe("ACCEPTED")

    const invitee = await db.user.findFirstOrThrow({
      where: { email: inviteEmail },
      select: { id: true },
    })
    const project = await db.project.findFirstOrThrow({
      where: { slug: formLoginProjectSlug },
      select: { id: true },
    })
    const membership = await db.membership.findFirst({
      where: { projectId: project.id, userId: invitee.id },
    })
    expect(membership).not.toBeNull()
  })

  test("already logged-in invited user accepts the invite by opening the mail link", async ({
    page,
  }) => {
    // Log in first (without any invite token), like a user with an active session
    await gotoInviteLogin(page)
    // Retry until the click lands: quick-login buttons are dead before hydration
    await expect(async () => {
      await page.getByRole("button", { name: "no-project", exact: true }).click()
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 5_000 })
    }).toPass({ timeout: 30_000 })

    // Opening the mail link while logged in must accept the invite, not drop it
    await page.goto(`/auth/login?inviteToken=${fixture.loggedInToken}`)
    await expect(page).toHaveURL(new RegExp(`/${loggedInProjectSlug}(\\?.*)?$`), {
      timeout: 30_000,
    })

    const db = await getTestDb()
    const invite = await db.invite.findFirstOrThrow({
      where: { id: fixture.loggedInInviteId },
      select: { status: true },
    })
    expect(invite.status).toBe("ACCEPTED")

    const invitee = await db.user.findFirstOrThrow({
      where: { email: inviteEmail },
      select: { id: true },
    })
    const project = await db.project.findFirstOrThrow({
      where: { slug: loggedInProjectSlug },
      select: { id: true },
    })
    const membership = await db.membership.findFirst({
      where: { projectId: project.id, userId: invitee.id },
    })
    expect(membership).not.toBeNull()
  })
})
