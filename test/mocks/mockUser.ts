import { CurrentUser } from "@/src/users/types"
import { User } from "@prisma/client"

export const mockUser: User = {
  id: 1,
  firstName: "Test User Firstname",
  lastName: "Test User Lastname",
  email: "user@email.com",
  phone: null,
  role: "USER",
  institution: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  hashedPassword: "",
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
