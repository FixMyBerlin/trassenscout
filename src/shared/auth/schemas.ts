import { z } from "zod"

const emailSchema = z
  .email({ error: "Ungültige E-Mail-Adresse." })
  .transform((str) => str.toLowerCase().trim())

const passwordSchema = z
  .string()
  .min(10, { error: "Pflichtfeld. Mindestens 10 Zeichen." })
  .max(100, { error: "Maximal 100 Zeichen." })
  .transform((str) => str.trim())

export const SignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().nullable(),
  firstName: z.string().min(1, { error: "Pflichtfeld." }),
  lastName: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  institution: z.string().nullable(),
  inviteToken: z.string().nullable(), // Signup will create a membership or not…
  privacyPolicyAccepted: z.boolean().refine((value) => value === true, {
    error: "Bitte bestätigen Sie die Datenschutzerklärung.",
  }),
})

export const UpdateUserSchema = z.object({
  phone: z.string().nullable(),
  firstName: z.string().min(1, { error: "Pflichtfeld." }),
  lastName: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  institution: z.string().nullable(),
})

export type UpdateUserType = z.infer<typeof UpdateUserSchema>

export const updateUserFormDefaultValues: UpdateUserType = {
  firstName: "",
  lastName: "",
  institution: null,
  phone: null,
}

export const Login = z.object({
  email: emailSchema,
  password: z.string(),
  inviteToken: z.string().nullish(), // Login will create a membership or not…
})

export const ForgotPassword = z.object({
  email: emailSchema,
})

export const ResetPassword = z
  .object({
    password: passwordSchema,
    passwordConfirmation: passwordSchema,
    token: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    error: "Die Passwörter stimmen nicht überein.",
    path: ["passwordConfirmation"],
  })

export const loginFormDefaultValues: z.infer<typeof Login> = {
  email: "",
  password: "",
  inviteToken: null,
}

export const signupFormDefaultValues: z.infer<typeof SignupSchema> = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: null,
  institution: null,
  inviteToken: null,
  privacyPolicyAccepted: false,
}

export const forgotPasswordFormDefaultValues: z.infer<typeof ForgotPassword> = {
  email: "",
}

export const resetPasswordFormDefaultValues: z.infer<typeof ResetPassword> = {
  password: "",
  passwordConfirmation: "",
  token: "",
}
