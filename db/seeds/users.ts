import db, { User } from "../index"

const seedUsers = async () => {
  // password: dev-team@fixmycity.de
  const hashedPassword =
    "JGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTIscD0xJDRMWm82dmVrRk91VnVlZTVwcEpiS3ckOHFZcHhyM2RITm0yTGxTeXdqeEcxSWFsZEJCUWhxNVZxdm53eHoxTk4xTQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="

  const seeData: Omit<User, "id" | "createdAt" | "updatedAt">[] = [
    {
      email: "dev-team@fixmycity.de",

      hashedPassword,
      role: "ADMIN",
      firstName: "Admin",
      lastName: "AdminUser",
      phone: "030 123456",
    },
    {
      email: "no-permissions@fixmycity.de",

      hashedPassword,
      role: "USER",
      firstName: "NoPermissions",
      lastName: "RegularUser",
      phone: null,
    },
    {
      email: "rs-spree-permissions@fixmycity.de",

      hashedPassword,
      role: "USER",
      firstName: "RS Spree Permissions",
      lastName: "RegularUser",
      phone: null,
    },
    {
      email: "all-projects-permissions@fixmycity.de",

      hashedPassword,
      role: "USER",
      firstName: "AllProjects Permissions",
      lastName: "RegularUser",
      phone: null,
    },
  ]

  for (let i = 0; i < seeData.length; i++) {
    const data = seeData[i]
    if (data) {
      await db.user.create({ data })
    }
  }
}

export default seedUsers
