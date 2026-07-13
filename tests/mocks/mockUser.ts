import { User } from "@/src/prisma/generated/client"

type CurrentUser = Pick<
  User,
  "id" | "firstName" | "lastName" | "email" | "phone" | "role" | "institution"
>

export const mockUser: User = {
  id: 1,
  firstName: "Test User Firstname",
  lastName: "Test User Lastname",
  email: "user@email.com",
  emailVerified: false,
  phone: null,
  role: "USER",
  institution: null,
  image: null,
  name: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  hashedPassword: "",
  passwordHashMigratedAt: null,
  passwordResetRequired: false,
}

export const mockCurrentUser: CurrentUser = {
  id: 1,
  firstName: "Test User Firstname",
  lastName: "Test User Lastname",
  email: "user@email.com",
  phone: null,
  role: "USER",
  institution: null,
}
