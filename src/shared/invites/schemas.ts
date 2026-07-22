import { z } from "zod"
import { MembershipRoleEnum } from "@/src/prisma/generated/browser"

export const InviteSchema = z.object({
  email: z.email(),
  role: z.enum(MembershipRoleEnum),
})

const InviteProjectSchema = z.object({
  projectSlug: z.string().min(1),
  role: z.enum(MembershipRoleEnum),
})

export const CreateInvitesSchema = z
  .object({
    email: z.email(),
    projects: z.array(InviteProjectSchema).min(1),
  })
  .refine(
    (input) =>
      new Set(input.projects.map((project) => project.projectSlug)).size === input.projects.length,
    {
      message: "Ein Projekt darf nur einmal ausgewählt werden.",
      path: ["projects"],
    },
  )

export const inviteFormDefaultValues: z.infer<typeof InviteSchema> = {
  email: "",
  role: "VIEWER",
}
