import { MembershipRoleEnum } from "@prisma/client"
import { z } from "zod"

export const email = z
  .string()
  .email({ message: "Ungültige E-Mail-Adresse." })
  .transform((str) => str.toLowerCase().trim())

export const password = z
  .string()
  .min(10, { message: "Pflichtfeld. Mindestens 10 Zeichen." })
  .max(100, { message: "Maximal 100 Zeichen." })
  .transform((str) => str.trim())

export const Signup = z.object({
  email,
  password,
  phone: z.string().nullable(),
  firstName: z.string().min(1, { message: "Pflichtfeld." }),
  lastName: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  institution: z.string().nullable(),
  inviteToken: z.string().nullable(), // Signup will create a membership or not…
})

export const UpdateUserSchema = z.object({
  phone: z.string().nullable(),
  firstName: z.string().min(1, { message: "Pflichtfeld." }),
  lastName: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  institution: z.string().nullable(),
})

export type UpdateUserType = z.infer<typeof UpdateUserSchema>

export const UpdateMembershipRole = z.object({
  membershipId: z.number(),
  role: z.nativeEnum(MembershipRoleEnum),
})

export const Login = z.object({
  email,
  password: z.string(),
  inviteToken: z.string().nullish(), // Login will create a membership or not…
})

export const ForgotPassword = z.object({
  email,
})

export const ResetPassword = z
  .object({
    password: password,
    passwordConfirmation: password,
    token: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Die Passwörter stimmen nicht überein.",
    path: ["passwordConfirmation"], // set the path of the error
  })

export const ChangePassword = z.object({
  currentPassword: z.string(),
  newPassword: password,
})
